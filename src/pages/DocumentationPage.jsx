import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const DocumentationPage = () => {
  return (
    <div className="container mx-auto p-4 bg-white rounded-2xl">
      <SwaggerUI url="https://aniflim.space/api/openapi.json" />
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white">
        {/* Заголовок */}
        <div className="space-y-2">
            <h1 className="text-4xl font-bold text-indigo-600">
            WebSocket Progress API
            </h1>
            <p className="text-gray-600 text-lg">
            Реальное время обновления прогресса просмотра аниме через WebSocket
            </p>
        </div>

        {/* Блок аутентификации */}
        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🔐 Аутентификация</h2>
            <p className="text-gray-600 mb-4">
            Токен передается через query-параметр при установке соединения:
            </p>
            <div className="bg-gray-800 p-4 rounded-md text-sm">
            <code className="text-green-400">
                wss://aniflim.space/api/ws?token=ВАШ_ТОКЕН
            </code>
            </div>
        </div>

        {/* Формат данных */}
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">📦 Формат данных</h2>
            
            <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-mono text-lg text-indigo-600 mb-2">Отправка данных</h3>
                <pre className="bg-gray-800 p-4 rounded-md text-sm text-gray-100">
                {JSON.stringify({
                    animeid: "number",
                    episode: "number",
                    currenttime: "number"
                }, null, 2)}
                </pre>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-mono text-lg text-green-600 mb-2">Успешный ответ</h3>
                <pre className="bg-gray-800 p-4 rounded-md text-sm text-gray-100">
                "Progress successfully updated"
                </pre>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-mono text-lg text-red-600 mb-2">Ошибка</h3>
                <pre className="bg-gray-800 p-4 rounded-md text-sm text-gray-100">
                {JSON.stringify({
                    error: "Описание ошибки"
                }, null, 2)}
                </pre>
            </div>
            </div>
        </div>

        {/* Пример использования */}
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">🛠 Пример использования</h2>
            
            <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-4">
                Подключение и отправка прогресса:
                </p>
                
                <pre className="bg-gray-800 p-4 rounded-md text-sm text-gray-100 overflow-x-auto">
              {`const socket = new WebSocket('wss://aniflim.space/api/ws?token=ВАШ_ТОКЕН');

// Обработчик открытия соединения
socket.addEventListener('open', (event) => {
  const progressData = {
    animeid: 123,
    episode: 5,
    currenttime: 542
  };
  socket.send(JSON.stringify(progressData));
});

// Обработчик ответов
socket.addEventListener('message', (event) => {
  console.log('Ответ сервера:', event.data);
});

// Обработчик ошибок
socket.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Особенности работы */}
            <div className="p-6 bg-blue-50 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">⚡ Особенности работы</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Обновление прогресса в реальном времени</li>
                <li>Автоматическое определение разницы во времени</li>
                <li>Синхронизация между разделами (Watching/Watched/Planed)</li>
                <li>Нулевая задержка обновления</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
