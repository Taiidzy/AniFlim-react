from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File, WebSocket, Query
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta
from passlib.context import CryptContext
from pydantic import BaseModel
import logging
import hashlib
import redis
import json
import jwt
import os


# -------------------------
# Логгирование
# -------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------
# Настройки JWT
# -------------------------
SECRET_KEY = "gykVAC6R56io0-=0(&^323ftyg)aD8e77&^@#dh-_=_)dsa"  # Замените на секретный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 99999

# -------------------------
# Инициализация Redis
# -------------------------
r = redis.Redis(host='95.163.231.160', port=6379, db=0, decode_responses=True)  # Замените на ip адрес сервера с Redis

# -------------------------
# Инициализация FastAPI и CORS
# -------------------------
app = FastAPI(root_path="/api")

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
AVATAR_DIR = "/var/www/aniflim/static/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)

# -------------------------
# Модель пользователя с колонкой anime
# -------------------------
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    avatar = Column(String)
    total_time = Column(Integer, default=0)
    total_episodes = Column(Integer, default=0)

class Watching(Base):
    __tablename__ = "watching"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    anime_id = Column(String, index=True)  # Идентификатор аниме (например, "1")
    episode = Column(Integer)

    user = relationship("User", back_populates="watching")

class Watched(Base):
    __tablename__ = "watched"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    anime_id = Column(String, index=True)
    episode = Column(Integer)

    user = relationship("User", back_populates="watched")

class Planed(Base):
    __tablename__ = "planed"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    anime_id = Column(String, index=True)
    episode = Column(Integer)

    user = relationship("User", back_populates="planned")

class Progress(Base):
    __tablename__ = "progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    anime_id = Column(Integer, index=True)
    episode = Column(Integer)
    currenttime = Column(Integer, nullable=False)

    user = relationship("User", back_populates="progress")


User.watching = relationship("Watching", back_populates="user")
User.watched = relationship("Watched", back_populates="user")
User.planned = relationship("Planed", back_populates="user")
User.progress = relationship("Progress", back_populates="user")
Base.metadata.create_all(bind=engine)

# -------------------------
# Контекст для хеширования паролей (bcrypt)
# -------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------
# Хеширование картинки
# -------------------------
def generate_hash(filename: str) -> str:
    return hashlib.md5(filename.encode()).hexdigest()

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
    nologout: bool = False

class UserResponse(BaseModel):
    id: int
    login: str
    avatar: str
    total_time: str

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
    action: str       # Тип действия: "watching", "watched", "planed"
    animeid: int
    episode: int

class AnimeDelete(BaseModel):
    animeid: int

class AnimeUser(BaseModel):
    animeid: int

class UpdateProgress(BaseModel):
    animeid: int
    episode: int
    currenttime: int
    duration: int


# -------------------------
# Эндпоинт регистрации
# -------------------------
@app.post("/register")
async def register(data: RegisterData, db: Session = Depends(get_db)):
    logger.info(f"Регистрация пользователя: {data.login}")
    existing_user = db.query(User).filter(User.login == data.login).first()
    if existing_user:
        logger.warning(f"Попытка регистрации с уже существующим логином: {data.login}")
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")
    
    hashed_password = pwd_context.hash(data.password)
    user = User(login=data.login, hashed_password=hashed_password, avatar="/static/avatars/default.png")
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(f"Пользователь {data.login} успешно зарегистрирован")
    return {"message": "Пользователь успешно зарегистрирован"}

# -------------------------
# Эндпоинт авторизации (логин) с использованием JWT и Redis
# -------------------------
@app.post("/login")
async def login(data: LoginData, db: Session = Depends(get_db)):
    logger.info(f"Попытка входа пользователя: {data.login}")
    user = db.query(User).filter(User.login == data.login).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        logger.warning(f"Неверный логин или пароль для пользователя: {data.login}")
        raise HTTPException(status_code=400, detail="Неверный логин или пароль")

    if data.nologout:
        # Токен без срока действия
        payload = {"sub": user.login}
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        # Сохраняем токен в Redis без времени жизни (бесконечно, пока не удалится вручную)
        r.set(token, user.login)
        logger.info(f"Пользователь {data.login} авторизован с бессрочным токеном")
    else:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": user.login, "exp": datetime.utcnow() + access_token_expires}
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        # Сохраняем токен в Redis с временем жизни
        r.set(token, user.login, ex=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        logger.info(f"Пользователь {data.login} авторизован с токеном, истекающим через {ACCESS_TOKEN_EXPIRE_MINUTES} минут")

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
    except:
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

# Функция для получения пользователя через query параметр
def get_current_user_from_query(token: str = Query(...), db: Session = Depends(get_db)):
    return get_current_user(x_token=token, db=db)

# -------------------------
# Эндпоинт для получения информации о пользователе
# -------------------------
@app.get("/user/info")
async def get_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logger.info(f"Получение информации о пользователе {current_user.login}")
    planed = db.query(Planed).filter_by(user_id=current_user.id).all()
    watching = db.query(Watching).filter_by(user_id=current_user.id).all()
    watched = db.query(Watched).filter_by(user_id=current_user.id).all()
    progress = db.query(Progress).filter_by(user_id=current_user.id).all()

    planed_list = [
        {
            "id": planed_item.anime_id,
            "episode": planed_item.episode,
        } for planed_item in planed
    ]

    watching_list = [
        {
            "id": watching_item.anime_id,
            "episode": watching_item.episode,
        } for watching_item in watching
    ]

    watched_list = [
        {
            "id": watched_item.anime_id,
            "episode": watched_item.episode,
        } for watched_item in watched
    ]

    progress_list = [
        {
            "id": progress_item.anime_id,
            "episode": progress_item.episode,
            "currenttime": progress_item.currenttime,
        } for progress_item in progress
    ]

    user = {
        "id": current_user.id,
        "login": current_user.login,
        "avatar": current_user.avatar,
        "total_time": current_user.total_time,
        "total_episode": current_user.total_episodes,
        "planed": planed_list,
        "watching": watching_list,
        "watched": watched_list,
        "progress": progress_list
    }
    return user

# -------------------------
# Эндпоинт изменения пароля
# -------------------------
@app.patch("/user/password")
async def change_password(
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
async def delete_account(
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
    
    # Проверяем, состоит ли login только из английских букв и цифр
    if not current_user.login.isascii() or not current_user.login.isalnum():
        filename = generate_hash(file.filename) + ".jpg"
    else:
        filename = f"{current_user.login}.jpg"
    
    # Удаляем старый аватар, если он не default.png
    old_avatar = current_user.avatar
    if old_avatar and "default.png" not in old_avatar:
        old_avatar_path = os.path.join("/var/www/aniflim", old_avatar.lstrip("/"))
        if os.path.exists(old_avatar_path):
            os.remove(old_avatar_path)
            logger.info(f"Старый аватар {old_avatar_path} удалён для пользователя {current_user.login}")
        else:
            logger.warning(f"Старый аватар {old_avatar_path} не найден для удаления у пользователя {current_user.login}")
    
    # Генерируем путь для сохранения нового аватара
    file_path = os.path.join(AVATAR_DIR, filename)
    
    # Сохраняем файл
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Обновляем путь к аватару в БД
    current_user.avatar = f"/static/avatars/{filename}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    logger.info(f"Аватар пользователя {current_user.login} обновлён: {current_user.avatar}")
    return {"message": "Аватар успешно обновлён", "avatar_url": current_user.avatar}

# -------------------------
# Эндпоинт выхода (logout)
# -------------------------
@app.post("/user/logout")
async def logout(current_user: User = Depends(get_current_user), x_token: str = Header(...)):
    r.delete(x_token)  # Удаляем токен из Redis
    logger.info(f"Пользователь {current_user.login} вышел из системы")
    return {"message": "Вы успешно вышли из системы"}





# -------------------------
# Эндпоинт добавления аниме в список
# -------------------------
@app.post("/anime")
async def update_anime(
    data: AnimeAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновление или добавление записи об аниме в соответствующую таблицу"""
    logger.info(f"Обновление аниме данных для пользователя {current_user.login}")
    
    try:
        if data.action == "watching":
            watching = Watching(user_id=current_user.id, anime_id=data.animeid, episode=data.episode)
            db.add(watching)
        elif data.action == "watched":
            watched = Watched(user_id=current_user.id, anime_id=data.animeid, episode=data.episode)
            db.add(watched)
            current_user.total_episodes += data.episode
        elif data.action == "planned":
            planed = Planed(user_id=current_user.id, anime_id=data.animeid, episode=data.episode)
            db.add(planed)
        else:
            raise HTTPException(status_code=400, detail="Неизвестное действие")
        
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        logger.error(f"Произошло исключение при обновлении данных аниме: {e}")
        raise HTTPException(status_code=500, detail="Произошло исключение при обновлении данных аниме")
    
# -------------------------
# Эндпоинт изменения списка аниме
# -------------------------
@app.patch("/anime")
async def patch_anime(
    data: AnimeAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновление записи о просмотре аниме"""
    logger.info(f"Обновление данных аниме для пользователя {current_user.login}")
    
    try:
        if data.action == "watching":
            existing = db.query(Watching).filter_by(user_id=current_user.id, anime_id=data.animeid).first()
            if existing:
                existing.episode = data.episode
            else:
                watching = Watching(user_id=current_user.id, anime_id=data.animeid, episode=data.episode)
                db.add(watching)
            db.query(Watched).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()
            db.query(Planed).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()

        elif data.action == "watched":
            existing = db.query(Watched).filter_by(user_id=current_user.id, anime_id=data.animeid).first()
            if existing:
                old_episode = existing.episode
                episode_diff = data.episode - old_episode
                current_user.total_episodes += episode_diff
                existing.episode = data.episode
            else:
                watched = Watched(user_id=current_user.id, anime_id=data.animeid, episode=data.episode)
                db.add(watched)
                current_user.total_episodes += data.episode
            
            db.query(Watching).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()
            db.query(Planed).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()

        elif data.action == "planed":
            existing = db.query(Planed).filter_by(user_id=current_user.id, anime_id=data.animeid).first()
            if existing:
                existing.episode = data.episode
            else:
                planed = Planed(user_id=current_user.id, anime_id=data.animeid, episode=data.episode)
                db.add(planed)
            db.query(Watching).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()
            db.query(Watched).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()

        else:
            raise HTTPException(status_code=400, detail="Неизвестное действие")
        
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        logger.error(f"Произошло исключение при обновлении данных аниме: {e}")
        raise HTTPException(status_code=500, detail="Произошло исключение при обновлении данных аниме")
    
    return {"message": "Данные аниме успешно обновлены"}

# -------------------------
# Эндпоинт для удаления аниме из списка
# -------------------------
@app.delete("/anime")
async def delete_anime(
    data: AnimeDelete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление записи об аниме из таблиц watching, watched или planed"""
    logger.info(f"Удаление аниме {data.animeid} для пользователя {current_user.login}")
    
    try:
        watched_entries = db.query(Watched).filter_by(user_id=current_user.id, anime_id=data.animeid).all()
        for entry in watched_entries:
            current_user.total_episodes -= entry.episode

        db.query(Watching).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()
        db.query(Watched).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()
        db.query(Planed).filter_by(user_id=current_user.id, anime_id=data.animeid).delete()
        
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        logger.error(f"Произошло исключение при обновлении данных аниме: {e}")
        raise HTTPException(status_code=500, detail="Произошло исключение при обновлении данных аниме")
    
    return {"message": f"Данные аниме {data.animeid} успешно удалены"}


# -------------------------
# Эндпоинт для получения информации об аниме в списке
# -------------------------
@app.post("/user/anime")
async def user_anime(
    data: AnimeUser,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Запрос для получения списка для аниме {data.animeid} для пользователя {current_user.login}")
    anime = {}

    try:
        item = db.query(Watching).filter_by(user_id=current_user.id, anime_id=data.animeid).first()
        if item:
            anime = {
                "id": item.anime_id,
                "episode": item.episode,
                "status": "watching"
            }
            return anime
        item = db.query(Watched).filter_by(user_id=current_user.id, anime_id=data.animeid).first()
        if item:
            anime = {
                "id": item.anime_id,
                "episode": item.episode,
                "status": "watched"
            }
            return anime
        item = db.query(Planed).filter_by(user_id=current_user.id, anime_id=data.animeid).first()
        if item:
            anime = {
                "id": item.anime_id,
                "episode": item.episode,
                "status": "planed"
            }
            return anime
    except Exception as e:
        logger.error(f"Произошло исключение при обновлении данных аниме: {e}")
        raise HTTPException(status_code=500, detail="Произошло исключение при обновлении данных аниме")
    anime = {
        "status": "not"
    }
    return anime


# -------------------------
# Эндпоинт для прогресса просмотра
# -------------------------
@app.websocket("/ws")
async def anime_progress(
    websocket: WebSocket,
    token: str = Query(...),  # Получаем токен из query-параметра
    db: Session = Depends(get_db)
):
    
    # Аутентификация пользователя
    try:
        user = get_current_user_from_query(token=token, db=db)
    except HTTPException as e:
        return

    await websocket.accept()
    
    while True:
        data = await websocket.receive_text()
        logger.info(f"WebSocket data from {user.login}: {data}")
        
        try:
            data = json.loads(data)
            animeid = data['animeid']
            episode = data['episode']
            current_time = int(data['currenttime'])

            progress = db.query(Progress).filter_by(
                user_id=user.id, 
                anime_id=animeid
            ).first()

            watching = db.query(Watching).filter_by(
                user_id=user.id, 
                anime_id=animeid
            ).first()

            watched = db.query(Watched).filter_by(
                user_id=user.id, 
                anime_id=animeid
            ).first()

            planed = db.query(Planed).filter_by(
                user_id=user.id, 
                anime_id=animeid
            ).first()

            time_diff = 0
            if progress:
                old_time = progress.currenttime
                old_episode = progress.episode
                if current_time > old_time:
                    time_diff = current_time - old_time
                progress.currenttime = current_time
                if old_episode != episode:
                    progress.episode = episode
                    progress.currenttime = 0
            else:
                time_diff = current_time
                progress = Progress(
                    user_id=user.id,
                    anime_id=animeid,
                    episode=episode,
                    currenttime=current_time
                )
                db.add(progress)

            if watching:
                watching.episode = episode
            elif watched:
                watched.episode = episode
            elif planed:
                planed.episode = episode

            user.total_time += time_diff
            db.commit()
            db.refresh(user)
            
            await websocket.send_text("Progress successfully updated")
        except Exception as e:
            logger.error(f"Ошибка: {e}")
            await websocket.send_text(f"Error: {str(e)}")


@app.post('/user/anime/progress/get')
async def get_progress(
    data: AnimeUser,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Запрос для получения прогресса для аниме {data.animeid} для пользователя {current_user.login}")
    anime = {}

    try:
        item = db.query(Progress).filter_by(user_id=current_user.id, anime_id=data.animeid).first()
        if item:
            anime = {
                "userId": current_user.id,
                "id": item.anime_id,
                "episode": item.episode,
                "currenttime": item.currenttime
            }
            return anime
        raise HTTPException(status_code=404, detail="Прогресс не найден")
    except Exception as e:
        logger.error(f"Произошло исключение при обновлении данных аниме: {e}")
        raise HTTPException(status_code=500, detail="Произошло исключение при обновлении данных аниме")
