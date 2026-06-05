const WINDOW_MS = 60 * 1000;
const MAX_CHEERS = 5;

// Key: "userId:performerId" → tracks per-user-per-performer
const userPerformerTimestamps = new Map();

function buildKey(userId, performerId) {
  return `${userId}:${performerId}`;
}

function checkRateLimit(userId, performerId) {
  const now = Date.now();
  const key = buildKey(userId, performerId);
  const timestamps = userPerformerTimestamps.get(key) || [];

  const valid = timestamps.filter(t => now - t < WINDOW_MS);
  userPerformerTimestamps.set(key, valid);

  if (valid.length >= MAX_CHEERS) {
    const oldest = valid[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      message: `操作过于频繁，您对该艺人每分钟最多应援${MAX_CHEERS}次，请${retryAfter}秒后再试`
    };
  }

  valid.push(now);
  userPerformerTimestamps.set(key, valid);
  return { allowed: true, remaining: MAX_CHEERS - valid.length, retryAfter: 0, message: null };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of userPerformerTimestamps.entries()) {
    const valid = timestamps.filter(t => now - t < WINDOW_MS);
    if (valid.length === 0) {
      userPerformerTimestamps.delete(key);
    } else {
      userPerformerTimestamps.set(key, valid);
    }
  }
}, 30 * 1000);

module.exports = { checkRateLimit };
