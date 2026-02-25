const mongoose = require('mongoose');
const fs = require('fs');

async function checkUser() {
  const email = 'educator@sit.ac.in';
  console.log(`🔍 Checking database for user: ${email}`);
  
  // Manually parse .env.local for MONGODB_URI
  let mongoUri = '';
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) mongoUri = match[1].trim();
  } catch (e) {
    console.error('❌ Could not read .env.local');
    return;
  }

  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Define a minimal schema
    const UserSchema = new mongoose.Schema({
      email: String,
      role: String,
      name: String
    }, { strict: false });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    const user = await User.findOne({ email }).lean();
    
    if (user) {
      console.log('✨ User Found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ User not found in database.');
      
      const count = await User.countDocuments();
      console.log(`\nTotal users in DB: ${count}`);
      
      const allUsers = await User.find({}, 'email role').sort({ _id: -1 }).limit(10).lean();
      console.log('\n📋 Most recent users in DB:');
      console.log(allUsers);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUser();
