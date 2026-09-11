const fs = require('fs');
const path = require('path');
const { init, saveDb } = require('./jsonDb');

const DEFAULT_DB_PATH = path.join(__dirname, '../../data/db.json');

function seed() {
  try {
    const committed = fs.readFileSync(DEFAULT_DB_PATH, 'utf8');
    const data = JSON.parse(committed);
    
    const DB_PATH = process.env.DB_PATH || (process.env.NODE_ENV === 'production' ? '/tmp/huu-db.json' : DEFAULT_DB_PATH);
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('Database seeded successfully!');
    console.log(`Users: ${data.users.length}`);
    console.log(`Donors: ${data.donors.length}`);
    console.log(`Drives: ${data.drives.length}`);
    console.log(`Notifications: ${data.notifications.length}`);
  } catch (err) {
    console.error('Failed to seed database:', err.message);
    process.exit(1);
  }
}

seed();
