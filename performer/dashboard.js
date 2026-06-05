const SERVER_URL = 'http://localhost:3000';
const socket = io(SERVER_URL, { transports: ['websocket'] });

const PERFORMER_ID = new URLSearchParams(window.location.search).get('id') || 'default';

const HEATMAP_COLS = 30;
const HEATMAP_ROWS = 15;
const HEATMAP_WINDOW_MS = 30 * 1000; // only show last 30 seconds

// Each cheer record with timestamp and grid position
const cheerRecords = [];

const heatmapCanvas = document.getElementById('heatmapCanvas');
const heatCtx = heatmapCanvas.getContext('2d');

let totalCheers = 0;
let colorCounts = {};

const totalCheersEl = document.getElementById('totalCheers');
const cheersPerMinEl = document.getElementById('cheersPerMin');
const topColorsEl = document.getElementById('topColors');

socket.on('connect', () => {
  console.log('Performer dashboard connected');
  socket.emit('join-performer', PERFORMER_ID);
});

socket.on('cheer-batch', (batch) => {
  for (const cheer of batch) {
    totalCheers++;

    colorCounts[cheer.color] = (colorCounts[cheer.color] || 0) + 1;

    cheerRecords.push({
      col: Math.floor(Math.random() * HEATMAP_COLS),
      row: Math.floor(Math.random() * HEATMAP_ROWS),
      color: cheer.color,
      timestamp: cheer.timestamp
    });
  }

  totalCheersEl.textContent = totalCheers;
  updateTopColors();
});

socket.on('effect-triggered', (data) => {
  console.log('Effect triggered:', data.effect);
});

document.querySelectorAll('.effect-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const effect = btn.dataset.effect;
    socket.emit('trigger-effect', { performerId: PERFORMER_ID, effect });
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
});

function updateTopColors() {
  const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  topColorsEl.innerHTML = sorted.map(([color, count]) =>
    `<div class="color-badge">
      <span class="color-dot" style="background:${color}"></span>
      <span>${count}</span>
    </div>`
  ).join('');
}

function drawHeatmap() {
  const now = Date.now();
  const cutoff = now - HEATMAP_WINDOW_MS;

  // Prune expired records
  while (cheerRecords.length > 0 && cheerRecords[0].timestamp < cutoff) {
    cheerRecords.shift();
  }

  // Build intensity grid from records within the 30s window
  const grid = Array.from({ length: HEATMAP_ROWS }, () => new Array(HEATMAP_COLS).fill(0));
  let activeCount = 0;

  for (const record of cheerRecords) {
    if (record.timestamp >= cutoff) {
      const age = (now - record.timestamp) / HEATMAP_WINDOW_MS; // 0=new, 1=about to expire
      const weight = 1 - age; // newer records contribute more
      grid[record.row][record.col] += weight * 0.3;
      activeCount++;
    }
  }

  // Update cheers/min display (extrapolate from 30s window)
  cheersPerMinEl.textContent = Math.round(activeCount * 2);

  // Render
  const w = heatmapCanvas.width / devicePixelRatio;
  const h = heatmapCanvas.height / devicePixelRatio;
  const cellW = w / HEATMAP_COLS;
  const cellH = h / HEATMAP_ROWS;

  heatCtx.fillStyle = '#0a0a14';
  heatCtx.fillRect(0, 0, w, h);

  for (let row = 0; row < HEATMAP_ROWS; row++) {
    for (let col = 0; col < HEATMAP_COLS; col++) {
      const intensity = Math.min(1, grid[row][col]);
      if (intensity > 0.01) {
        const r = Math.floor(168 + 87 * intensity);
        const g = Math.floor(85 * (1 - intensity));
        const b = Math.floor(247 * intensity);
        heatCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${intensity * 0.9})`;
        heatCtx.fillRect(col * cellW, row * cellH, cellW - 1, cellH - 1);
      }
    }
  }
}

function animateHeatmap() {
  drawHeatmap();
  requestAnimationFrame(animateHeatmap);
}

function resizeHeatmap() {
  const rect = heatmapCanvas.getBoundingClientRect();
  heatmapCanvas.width = rect.width * devicePixelRatio;
  heatmapCanvas.height = rect.height * devicePixelRatio;
  heatCtx.scale(devicePixelRatio, devicePixelRatio);
}

window.addEventListener('resize', resizeHeatmap);
resizeHeatmap();
animateHeatmap();
