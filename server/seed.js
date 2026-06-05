const mongoose = require('mongoose');
const Performer = require('./models/Performer');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cheer-wall';

const seedPerformers = [
  { name: '小明', description: '吉他弹唱', active: true },
  { name: 'DJ阿杰', description: '电子音乐现场', active: true },
  { name: '街舞团', description: '霹雳舞表演', active: true },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Performer.deleteMany({});
  await Performer.insertMany(seedPerformers);
  console.log('Seeded performers:', seedPerformers.map(p => p.name).join(', '));
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
