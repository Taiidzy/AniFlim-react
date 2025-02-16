import os
from datetime import datetime, timedelta

import jwt
from jwt import PyJWTError

from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.types import JSON as SQLAlchemyJSON
from sqlalchemy.ext.declarative import declarative_base
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.mutable import MutableDict
from passlib.context import CryptContext
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import redis
import logging

# -------------------------
# Логгирование
# -------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------
# Настройки JWT
# -------------------------
SECRET_KEY = "secret_key"  # Замените на секретный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# -------------------------
# Инициализация Redis
# -------------------------
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)  # Замените на ip адрес сервера с Redis

# -------------------------
# Инициализация FastAPI и CORS
# -------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_credentials=True,
    allow_methods=["*"],      
    allow_headers=["*"],      
)

# -------------------------
# Настройка базы данных (main.db)
# -------------------------
SQLALCHEMY_DATABASE_URL = "sqlite:///./aniflim.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------------
# Папка для хранения аватарок
# -------------------------
AVATAR_DIR = "static/avatars"
app.mount("/static", StaticFiles(directory="static"), name="static")
os.makedirs(AVATAR_DIR, exist_ok=True)  # Создаём папку, если её нет

# -------------------------
# Модель пользователя с колонкой anime
# -------------------------
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    avatar = Column(String, default="")       # путь к аватарке
    total_time = Column(String, default="")     # общее время (если требуется)
    # Колонка anime для хранения JSON-структуры с данными об аниме
    anime = Column(MutableDict.as_mutable(SQLAlchemyJSON), default=lambda: {})

Base.metadata.create_all(bind=engine)

# -------------------------
# Контекст для хеширования паролей (bcrypt)
# -------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------
# Зависимость для работы с сессией SQLAlchemy
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# Pydantic-схемы
# -------------------------
class RegisterData(BaseModel):
    login: str
    password: str

class LoginData(BaseModel):
    login: str
    password: str

# Схема для обновления информации об аниме
class AnimeUpdate(BaseModel):
    animeid: str    # Идентификатор аниме (например, "1")
    type: str       # Тип (например, "Watch")
    episode: str    # Номер эпизода (например, "1")
    currenttime: str  # Прогресс просмотра (например, "892")

class UserResponse(BaseModel):
    id: int
    login: str
    avatar: str
    total_time: str
    anime: dict

    class Config:
        orm_mode = True

class ChangePasswordData(BaseModel):
    login: str
    old_password: str
    new_password: str

class DeleteAccountData(BaseModel):
    login: str
    password: str

class AnimeAction(BaseModel):
    action: str       # Тип действия: "watch", "viewed", "planned"
    animeid: str
    episode: str
    currenttime: str

class AnimeDelete(BaseModel):
    animeid: str


# -------------------------
# Эндпоинт регистрации
# -------------------------
@app.post("/register")
def register(data: RegisterData, db: Session = Depends(get_db)):
    logger.info(f"Регистрация пользователя: {data.login}")
    existing_user = db.query(User).filter(User.login == data.login).first()
    if existing_user:
        logger.warning(f"Попытка регистрации с уже существующим логином: {data.login}")
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")
    
    hashed_password = pwd_context.hash(data.password)
    user = User(login=data.login, hashed_password=hashed_password, anime={}, avatar="/static/avatars/default.png")
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(f"Пользователь {data.login} успешно зарегистрирован")
    return {"message": "Пользователь успешно зарегистрирован"}

# -------------------------
# Эндпоинт авторизации (логин) с использованием JWT и Redis
# -------------------------
@app.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    logger.info(f"Попытка входа пользователя: {data.login}")
    user = db.query(User).filter(User.login == data.login).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        logger.warning(f"Неверный логин или пароль для пользователя: {data.login}")
        raise HTTPException(status_code=400, detail="Неверный логин или пароль")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user.login, "exp": datetime.utcnow() + access_token_expires}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    # Сохраняем токен в Redis с временем жизни
    r.set(token, user.login, ex=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    
    logger.info(f"Пользователь {data.login} успешно авторизован")
    return {"token": token}

# -------------------------
# Зависимость для получения текущего пользователя по JWT
# -------------------------
def get_current_user(x_token: str = Header(...), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(x_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logger.error("Токен не содержит пользователя (sub)")
            raise HTTPException(status_code=401, detail="Неверный токен")
    except PyJWTError:
        logger.error("Ошибка декодирования JWT токена")
        raise HTTPException(status_code=401, detail="Неверный токен")
    
    if not r.get(x_token):
        logger.warning("Токен отсутствует или истек в Redis")
        raise HTTPException(status_code=401, detail="Токен отсутствует или истек")
    
    user = db.query(User).filter(User.login == username).first()
    if not user:
        logger.error(f"Пользователь {username} не найден в БД")
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    return user

# -------------------------
# Эндпоинт для получения информации о пользователе
# -------------------------
@app.get("/user/info", response_model=UserResponse)
def get_user_info(current_user: User = Depends(get_current_user)):
    logger.info(f"Получение информации о пользователе {current_user.login}")
    return current_user

# -------------------------
# Эндпоинт изменения пароля
# -------------------------
@app.patch("/user/password")
def change_password(
    data: ChangePasswordData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Попытка изменения пароля для пользователя {current_user.login}")
    # Проверяем, что логин совпадает с текущим пользователем
    if data.login != current_user.login:
        logger.warning(f"Пользователь {current_user.login} попытался изменить пароль для {data.login}")
        raise HTTPException(status_code=403, detail="Вы не можете изменить пароль другого пользователя")

    # Проверяем старый пароль
    if not pwd_context.verify(data.old_password, current_user.hashed_password):
        logger.warning(f"Неверный старый пароль для пользователя {current_user.login}")
        raise HTTPException(status_code=400, detail="Старый пароль неверный")

    # Хешируем новый пароль и обновляем его в БД
    new_hashed_password = pwd_context.hash(data.new_password)
    current_user.hashed_password = new_hashed_password

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    logger.info(f"Пароль успешно изменён для пользователя {current_user.login}")
    return {"message": "Пароль успешно изменён"}

# -------------------------
# Эндпоинт удаления аккаунта
# -------------------------
@app.delete("/user/delete")
def delete_account(
    data: DeleteAccountData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Попытка удаления аккаунта пользователя {current_user.login}")
    # Проверяем, что логин совпадает с текущим пользователем
    if data.login != current_user.login:
        logger.warning(f"Пользователь {current_user.login} попытался удалить аккаунт другого пользователя: {data.login}")
        raise HTTPException(status_code=403, detail="Вы не можете удалить другой аккаунт")

    # Проверяем пароль
    if not pwd_context.verify(data.password, current_user.hashed_password):
        logger.warning(f"Неверный пароль при попытке удаления аккаунта пользователя {current_user.login}")
        raise HTTPException(status_code=400, detail="Неверный пароль")

    # Удаляем пользователя из БД
    db.delete(current_user)
    db.commit()

    # Удаляем токен из Redis
    r.delete(current_user.login)

    # Удаляем аватарку, если она не default.png
    avatar_path = current_user.avatar
    if avatar_path and "default.png" not in avatar_path:
        actual_avatar_path = avatar_path.lstrip("/")
        if os.path.exists(actual_avatar_path):
            os.remove(actual_avatar_path)
            logger.info(f"Аватар {actual_avatar_path} для пользователя {current_user.login} удалён")
        else:
            logger.warning(f"Аватар {actual_avatar_path} для пользователя {current_user.login} не найден для удаления")

    logger.info(f"Аккаунт пользователя {current_user.login} успешно удалён")
    return {"message": "Аккаунт успешно удалён"}

# -------------------------
# Эндпоинт изменения аватара
# -------------------------
@app.patch("/user/avatar")
async def update_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Попытка обновления аватара для пользователя {current_user.login}")
    # Проверяем формат файла
    allowed_types = ["image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        logger.warning(f"Неверный формат файла для аватара пользователя {current_user.login}: {file.content_type}")
        raise HTTPException(status_code=400, detail="Допустимые форматы: JPEG, PNG")

    # Удаляем старый аватар, если он не default.png
    old_avatar = current_user.avatar
    if old_avatar and "default.png" not in old_avatar:
        old_avatar_path = old_avatar.lstrip("/")
        if os.path.exists(old_avatar_path):
            os.remove(old_avatar_path)
            logger.info(f"Старый аватар {old_avatar_path} удалён для пользователя {current_user.login}")
        else:
            logger.warning(f"Старый аватар {old_avatar_path} не найден для удаления у пользователя {current_user.login}")

    # Генерируем путь для сохранения нового аватара
    file_extension = file.filename.split(".")[-1]
    filename = f"{current_user.login}.{file_extension}"
    file_path = os.path.join(AVATAR_DIR, filename)

    # Сохраняем файл
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Обновляем путь к аватару в БД
    current_user.avatar = f"/{file_path}"  # Храним путь в БД
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    logger.info(f"Аватар пользователя {current_user.login} обновлён: {current_user.avatar}")
    return {"message": "Аватар успешно обновлён", "avatar_url": current_user.avatar}

# -------------------------
# Эндпоинт выхода (logout)
# -------------------------
@app.post("/user/logout")
def logout(current_user: User = Depends(get_current_user), x_token: str = Header(...)):
    r.delete(x_token)  # Удаляем токен из Redis
    logger.info(f"Пользователь {current_user.login} вышел из системы")
    return {"message": "Вы успешно вышли из системы"}





# -------------------------
# Эндпоинты для работы с аниме
# -------------------------
@app.post("/anime")
def update_anime(
    data: AnimeAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновление или добавление записи об аниме"""
    logger.info(f"Обновление аниме данных для пользователя {current_user.login}")
    
    # Получаем текущие данные об аниме
    anime_data = current_user.anime
    
    # Создаем раздел для действия, если его нет
    if data.action not in anime_data:
        anime_data[data.action] = {}
    
    # Обновляем или добавляем запись
    anime_data[data.action][data.animeid] = {
        "episode": data.episode,
        "currenttime": data.currenttime
    }
    
    # Сохраняем изменения
    current_user.anime = anime_data
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Данные аниме успешно обновлены"}

@app.delete("/anime")
def delete_anime(
    data: AnimeDelete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление всех записей об аниме по ID"""
    logger.info(f"Удаление аниме {data.animeid} для пользователя {current_user.login}")
    
    anime_data = current_user.anime
    
    # Удаляем аниме из всех разделов
    for action in list(anime_data.keys()):
        if data.animeid in anime_data.get(action, {}):
            del anime_data[action][data.animeid]
            
            # Удаляем пустые разделы
            if not anime_data[action]:
                del anime_data[action]
    
    # Сохраняем изменения
    current_user.anime = anime_data
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Данные аниме успешно удалены"}
