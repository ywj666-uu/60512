const express = require('express');
const Cheer = require('../models/Cheer');

const router = express.Router();

router.get('/stats/:performerId', async (req, res) => {
  try {
    const { performerId } = req.params;
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const [total, recentCount, colorStats] = await Promise.all([
      Cheer.countDocuments({ performerId }),
      Cheer.countDocuments({ performerId, timestamp: { $gte: oneMinuteAgo } }),
      Cheer.aggregate([
        { $match: { performerId: require('mongoose').Types.ObjectId(performerId) } },
        { $group: { _id: '$color', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({ total, cheersPerMinute: recentCount, topColors: colorStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
