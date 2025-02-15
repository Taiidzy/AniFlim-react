export const downloadTorrent = async (id) => {
  try {
    console.log(`[CLIENT] Отправляем запрос на скачивание торрента с ID: ${id}`);

    const response = await fetch(`https://aniflim.space/api/torrent/${id}`, {
      method: 'GET',
    });

    console.log(`[CLIENT] Ответ сервера: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`[CLIENT] Ошибка при загрузке файла: ${response.status} ${response.statusText}`);
      return;
    }

    // Получаем заголовок Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    console.log(`[CLIENT] Заголовок Content-Disposition:`, contentDisposition);

    let filename = `${id}.torrent`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+?)"/);
      if (match) {
        filename = match[1];
      }
    }

    console.log(`[CLIENT] Скачиваем файл с именем: ${filename}`);

    // Создаём ссылку для скачивания
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log(`[CLIENT] Файл ${filename} успешно скачан`);
  } catch (error) {
    console.error(`[CLIENT] Ошибка:`, error);
  }
};
