export const downloadTorrent = async (id) => {
  try {
    const response = await fetch(`http://192.168.0.102:3001/torrent/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Ошибка при загрузке файла');
      return;
    }

    // Получаем заголовок Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `${id}.torrent`; // Имя по умолчанию, если заголовка нет

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+?)"/);
      if (match) {
        filename = match[1];
      }
    }

    // Создаём ссылку для скачивания
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename; // Используем оригинальное имя файла
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка:', error);
  }
};
