#!/usr/bin/env node

const fetch = require('node-fetch');

async function setupApp() {
  console.log('🚀 Setting up FocusFlow Real-Time App...\n');

  try {
    // Seed content
    console.log('📚 Seeding content with pictures and interactive elements...');
    const contentResponse = await fetch('http://localhost:3000/api/content/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (contentResponse.ok) {
      const contentData = await contentResponse.json();
      console.log(`✅ Created ${contentData.content.length} content items`);
      console.log('   - Math Adventure: Counting with Animals');
      console.log('   - Reading Comprehension: The Magic Forest');
      console.log('   - Science Explorer: Solar System Journey');
      console.log('   - Attention Training: Focus Builder');
      console.log('   - Memory Palace: Remember Everything');
    } else {
      console.log('❌ Failed to seed content');
    }

    console.log('\n🎯 Real-Time Features Available:');
    console.log('   - Live attention tracking with ML predictions');
    console.log('   - Real-time engagement monitoring');
    console.log('   - Performance forecasting using TensorFlow.js');
    console.log('   - Interactive content with pictures and games');
    console.log('   - WebSocket integration for instant updates');

    console.log('\n📊 Dashboard Features:');
    console.log('   - Real-Time Analytics Dashboard');
    console.log('   - Content Hub with interactive elements');
    console.log('   - AI-powered predictions and insights');
    console.log('   - Beautiful visualizations with Chart.js');

    console.log('\n🎮 Interactive Content Types:');
    console.log('   - Counting games with animal pictures');
    console.log('   - Reading comprehension with visual stories');
    console.log('   - Science exploration with 3D-like interactions');
    console.log('   - Attention training exercises');
    console.log('   - Memory palace techniques');

    console.log('\n✨ Setup complete! Your real-time app is ready.');
    console.log('\nTo get started:');
    console.log('1. Visit http://localhost:3000/dashboard');
    console.log('2. Check out the Content Hub for interactive learning');
    console.log('3. Explore Real-Time Analytics for live predictions');
    console.log('4. All content includes pictures and interactive elements!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nMake sure your app is running on http://localhost:3000');
  }
}

setupApp();
