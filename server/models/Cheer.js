const mongoose = require('mongoose');

const cheerSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  performerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Performer', required: true },
  color: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

cheerSchema.index({ performerId: 1, timestamp: -1 });

module.exports = mongoose.model('Cheer', cheerSchema);
