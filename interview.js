let mediaRecorder;
let recordedChunks = [];
let applicationId = null;

// Получение vacancy_id из URL
function getVacancyIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('vacancy_id'));
}

document.addEventListener('DOMContentLoaded', async () => {
  const preview = document.getElementById('preview');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const status = document.getElementById('status');
  const questionsContainer = document.getElementById('questions');

  const token = localStorage.getItem('token');

  // Запрос камеры и микрофона
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  preview.srcObject = stream;

  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'interview.webm');

    status.textContent = '⏳ Отправка...';

    try {
      const res = await fetch(`/interview/upload-video?application_id=${applicationId}`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token
        },
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      status.textContent = '✅ Видео успешно загружено!';
    } catch (err) {
      status.textContent = '❌ Ошибка: ' + err.message;
    }
  };

  // Кнопка "Начать запись"
  startBtn.onclick = async () => {
    try {
      const vacancyId = getVacancyIdFromUrl();
      if (!vacancyId) throw new Error('vacancy_id не найден в URL');

      const res = await fetch('/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ vacancy_id: vacancyId })
      });

      if (!res.ok) throw new Error('Ошибка старта интервью');

      const questions = await res.json();
      applicationId = questions[0].application_id;

      // Отображение вопросов
      questionsContainer.innerHTML = questions.map(q => `<p>${q.text}</p>`).join('');

      recordedChunks = [];
      mediaRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      status.textContent = '🔴 Запись...';
    } catch (err) {
      status.textContent = '❌ Ошибка: ' + err.message;
    }
  };

  // Кнопка "Остановить запись"
  stopBtn.onclick = () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };
});
