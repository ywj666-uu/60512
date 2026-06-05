const Cheer = require('../models/Cheer');
const { checkRateLimit } = require('../middleware/rateLimiter');

const BATCH_INTERVAL_MS = 50;

let cheerQueue = [];
let batchTimer = null;

function setupSocketHandlers(io) {
  function startBatchProcessor() {
    if (batchTimer) return;
    batchTimer = setInterval(() => flushQueue(io), BATCH_INTERVAL_MS);
  }

  function flushQueue(io) {
    if (cheerQueue.length === 0) return;

    const batch = cheerQueue.splice(0);

    const displayPayload = batch.map(c => ({
      id: c.id,
      performerId: c.performerId,
      color: c.color,
      timestamp: c.timestamp
    }));
    io.to('display').emit('cheer-batch', displayPayload);

    const performerGroups = {};
    for (const cheer of batch) {
      if (!performerGroups[cheer.performerId]) {
        performerGroups[cheer.performerId] = [];
      }
      performerGroups[cheer.performerId].push({
        id: cheer.id,
        color: cheer.color,
        timestamp: cheer.timestamp
      });
    }
    for (const [performerId, cheers] of Object.entries(performerGroups)) {
      io.to(`performer:${performerId}`).emit('cheer-batch', cheers);
    }

    // Bulk write to DB (non-blocking, doesn't delay the push)
    const docs = batch.map(c => ({
      userId: c.userId,
      performerId: c.performerId,
      color: c.color,
      timestamp: new Date(c.timestamp)
    }));
    Cheer.insertMany(docs).catch(err => {
      console.error('Batch DB write failed:', err.message);
    });
  }

  startBatchProcessor();

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-display', () => {
      socket.join('display');
    });

    socket.on('join-performer', (performerId) => {
      socket.join(`performer:${performerId}`);
    });

    socket.on('cheer', (data) => {
      const { userId, performerId, color } = data;

      if (!userId || !performerId || !color) {
        socket.emit('cheer-error', { message: '缺少必填字段' });
        return;
      }

      const rateResult = checkRateLimit(userId, performerId);
      if (!rateResult.allowed) {
        socket.emit('rate-limited', {
          remaining: rateResult.remaining,
          retryAfter: rateResult.retryAfter,
          message: rateResult.message
        });
        return;
      }

      const timestamp = Date.now();
      cheerQueue.push({
        id: `${userId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
        userId,
        performerId,
        color,
        timestamp
      });

      socket.emit('cheer-success', {
        remaining: rateResult.remaining,
        retryAfter: 0
      });
    });

    socket.on('trigger-effect', (data) => {
      const { performerId, effect } = data;
      if (!performerId || !effect) return;

      io.to('display').emit('special-effect', { effect, performerId });
      io.to(`performer:${performerId}`).emit('effect-triggered', { effect });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketHandlers };
