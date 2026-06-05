const SERVER_URL = 'http://localhost:3000';
const socket = io(SERVER_URL, { transports: ['websocket'] });

let totalCheers = 0;
const cheerCountEl = document.getElementById('cheerCount');

socket.on('connect', () => {
  console.log('Display connected to server');
  socket.emit('join-display');
});

socket.on('cheer-batch', (batch) => {
  for (const cheer of batch) {
    spawnCheerParticles(cheer.color);
    totalCheers++;
  }
  cheerCountEl.textContent = totalCheers;
});

socket.on('special-effect', (data) => {
  switch (data.effect) {
    case 'fireworks':
      triggerFireworks();
      break;
    case 'wave':
      triggerWave();
      break;
    case 'rainbow':
      triggerRainbow();
      break;
  }
});

socket.on('disconnect', () => {
  console.log('Display disconnected');
});
