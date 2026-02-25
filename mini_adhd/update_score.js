
const mongoose = require('mongoose');
const { User } = require('./models/User');
const { connectToDatabase } = require('./lib/db');

async function updateScore() {
  await connectToDatabase();
  // Find the most recently created user or a specific test user
  const user = await User.findOne().sort({ createdAt: -1 });
  if (user) {
    user.adhdScore = 75; // High ADHD
    await user.save();
    console.log(`Updated user ${user.email} with score 75`);
  } else {
    console.log('No user found');
  }
  process.exit(0);
}

updateScore().catch(console.error);
