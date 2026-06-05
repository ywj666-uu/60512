const express = require('express');
const Performer = require('../models/Performer');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const performers = await Performer.find({ active: true }).sort({ name: 1 });
    res.json(performers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performers' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, avatar, description } = req.body;
    const performer = await Performer.create({ name, avatar, description });
    res.status(201).json(performer);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create performer' });
  }
});

router.patch('/:id/active', async (req, res) => {
  try {
    const performer = await Performer.findByIdAndUpdate(
      req.params.id,
      { active: req.body.active },
      { new: true }
    );
    if (!performer) return res.status(404).json({ error: 'Performer not found' });
    res.json(performer);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update performer' });
  }
});

module.exports = router;
