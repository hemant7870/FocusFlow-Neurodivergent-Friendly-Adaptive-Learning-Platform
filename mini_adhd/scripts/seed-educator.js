const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');

async function seedEducator() {
  const email = 'educator@sit.ac.in';
  const password = 'password123';
  const name = 'Admin Educator';
  const role = 'Educator';

  console.log(`🌱 Seeding educator account: ${email}`);
  
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
    
    // Define User Schema (as used in models/User.ts)
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ['Student', 'Parent', 'Educator', 'Admin'], default: 'Student' },
      adhdScore: { type: Number, default: 0 }
    }, { timestamps: true });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ User already exists. Updating password...');
      existing.password = await bcrypt.hash(password, 10);
      existing.role = role;
      await existing.save();
      console.log('✅ Password and role updated.');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        adhdScore: 75 // Some dummy score so they bypass the test
      });
      console.log('✅ Educator account created successfully.');
    }
    
    console.log(`\nCredentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedEducator();
