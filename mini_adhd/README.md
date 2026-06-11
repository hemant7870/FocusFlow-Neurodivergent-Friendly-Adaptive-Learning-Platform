# 🧠 FocusFlow - ADHD Detection & Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.20-orange)](https://www.tensorflow.org/js)

> An intelligent ADHD detection and adaptive learning platform with real-time monitoring, ML-powered predictions, and gamified learning experiences.

## 🚀 Live Demo

**Deployment Status**: Ready to deploy
**Platform**: Railway.app (supports full WebSocket functionality)

To deploy your own instance, see [Deployment Guide](.agent/workflows/deploy.md)

## ✨ Features

### 🎯 ADHD Detection & Assessment
- Comprehensive ADHD screening test
- Real-time attention tracking using TensorFlow.js
- Face landmarks detection for focus analysis
- Personalized ADHD score calculation

### 📊 Real-Time Monitoring
- Live attention level tracking
- Performance metrics dashboard
- Mood and engagement monitoring
- WebSocket-powered real-time updates

### 🤖 ML-Powered Predictions
- Attention trend forecasting
- Performance predictions
- Engagement level analysis
- Adaptive difficulty adjustments

### 🎮 Gamification
- Achievement system with badges
- Points and rewards
- Progress tracking
- Focus mode challenges

### 📚 Adaptive Learning
- Personalized content recommendations
- Interactive learning modules
- Progress-based content adaptation
- Learning style analysis

### 👤 User Management
- Secure authentication (JWT)
- User profiles and preferences
- Session management
- Progress history

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **ML/AI**: TensorFlow.js, Face Landmarks Detection
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, React-Chartjs-2
- **Authentication**: JWT with bcrypt
- **Animation**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/hemant7870/FocusFlow-Neurodivergent-Friendly-Adaptive-Learning-Platform.git
cd FocusFlow-Neurodivergent-Friendly-Adaptive-Learning-Platform/mini_adhd
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the `mini_adhd` directory:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=focusflow
JWT_SECRET=your_secure_secret_key
NODE_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
mini_adhd/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── adhd-test/         # ADHD assessment
│   └── learn/             # Learning modules
├── components/            # React components
│   ├── gamification/      # Gamification features
│   ├── progress/          # Progress tracking
│   └── ...
├── lib/                   # Utilities and configurations
│   ├── ml/               # ML models and predictors
│   ├── realtime/         # Real-time data collection
│   ├── websocket/        # Socket.io server
│   └── db.ts             # Database connection
├── models/               # MongoDB schemas
└── scripts/              # Utility scripts
```

## 🌐 Deployment

This app is deployment-ready for **Railway.app** with full Socket.io support.

### Quick Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Deploy from repo: `hemant7870/FocusFlow-Neurodivergent-Friendly-Adaptive-Learning-Platform`
4. Set environment variables (see `.env.example`)
5. Deploy!

**Detailed instructions**: See [.agent/workflows/deploy.md](.agent/workflows/deploy.md)

### Alternative Platforms

- **Vercel**: Requires Socket.io modifications (serverless limitations)
- **Render**: Full support, similar to Railway
- **Heroku**: Full support with Heroku Dynos

## 🔧 Configuration

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add database user
4. Whitelist IP: `0.0.0.0/0` (for deployment)
5. Get connection string and add to `.env.local`

### Socket.io Configuration

Socket.io is configured for real-time features:
- Automatic reconnection
- Room-based broadcasting
- User authentication
- Periodic data updates (5s intervals)
- Prediction broadcasts (30s intervals)

## 🧪 API Routes

Key API endpoints:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile
- `GET /api/learning/content` - Get adaptive content
- `POST /api/realtime/data` - Submit real-time data
- `POST /api/realtime/predict` - Get ML predictions
- `GET /api/gamification/progress` - Get user achievements

## 🎨 Features in Development

- [ ] Advanced ML model training
- [ ] Parent/Teacher dashboards
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Social features and peer connections

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Hemant**
- GitHub: [@hemant7870](https://github.com/hemant7870)

## 🙏 Acknowledgments

- TensorFlow.js team for ML capabilities
- Next.js team for the amazing framework
- MongoDB for database solution
- Socket.io for real-time communication
