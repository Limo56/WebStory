// Прописываем оригинальный текст вручную, так как в HTML теперь кубики
const originalText = "ГОРОДСКОЙ ПОРТАЛ"; 
const el = document.getElementById('glitch-text');
const glitchChar = '█';

setInterval(() => {
  let glitchedText = '';

  for (let i = 0; i < originalText.length; i++) {
    // Пропускаем пробелы, чтобы структура не ломалась
    if (originalText[i] === ' ') {
      glitchedText += ' ';
      continue;
    }

    // Шанс, что буква останется или станет кубиком
    if (Math.random() < 0.7) {
      glitchedText += glitchChar;
    } else {
      glitchedText += originalText[i];
    }
  }

  el.innerText = glitchedText;
}, 5000); // Скорость мигания (в миллисекундах)
