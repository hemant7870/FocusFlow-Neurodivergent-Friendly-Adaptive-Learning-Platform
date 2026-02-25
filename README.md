# 🧠 FocusFlow: AI-Powered Adaptive Learning for Neurodivergent Minds

![FocusFlow Banner](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Tech](https://img.shields.io/badge/Built_With-Next.js_14_|_TensorFlow.js_|_MongoDB-black?style=for-the-badge)

**FocusFlow** is a cutting-edge, real-time adaptive learning platform designed specifically to support individuals with ADHD and other neurodivergent traits. By leveraging **Convolutional Neural Networks (CNNs)** and **Browser-based Computer Vision**, FocusFlow creates a personalized study environment that dynamically adjusts to the user's focus levels in real-time.

---

## 🚀 Key Features

###  Real-Time Attention Tracking
-   **Privacy-First Computer Vision**: Uses **TensorFlow.js (MediaPipe Face Mesh)** to analyze gaze direction, blink rates, and head pose client-side. **No video data is ever recorded or sent to a server.**
-   **Distraction Detection**: Instantly detects when a user looks away or loses focus and provides gentle nudges to return to the task.
-   **Fatigue Analysis**: Monitors blink patterns to detect cognitive fatigue and suggests break times before burnout occurs.

###  Adaptive Learning Engine
-   **Dynamic Difficulty Adjustment**: The system lowers quiz difficulty when it senses frustration and increases it when the user is "in the zone."
-   **Personalized ML Predictions**: Custom neural networks (`tf.layers`) predict future engagement trends based on session history, time of day, and performance metrics.

###  Gamification & Progress
-   **Visual Feedback**: Real-time charts and heatmaps show focus quality over time.
-   **Reward System**: Earn points and streaks for maintaining "Deep Work" states.

---

##  Technology Stack

*   **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS, Framer Motion.
*   **AI/ML**: [TensorFlow.js](https://www.tensorflow.org/js), MediaPipe Face Mesh.
*   **Backend**: Node.js (Serverless Actions), MongoDB (Mongoose).
*   **Authentication**: Custom JWT-based auth with Role-Based Access Control (Student, Parent, Educator).

---

## 💻 Getting Started

### Prerequisites
-   Node.js 18+
-   MongoDB Atlas Account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/hemant7870/FocusFlow-Neurodivergent-Friendly-Adaptive-Learning-Platform.git
    cd FocusFlow-Neurodivergent-Friendly-Adaptive-Learning-Platform
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Configure Environment
    Create a `.env.local` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_random_string
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛡️ Privacy & Ethics
FocusFlow is built with a **Privacy-First Architecture**.
*   **Local Inference**: All camera processing happens directly in your browser.
*   **Data Minimization**: Only abstract metadata (e.g., "Attention Score: 85%") is stored to track progress; raw video frames are discarded immediately.

---

## 🤝 Contributing
We welcome contributions from the community, especially those with expertise in accessibility, neuroscience, or machine learning.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <i>Built with ❤️ for better learning.</i>
</p>
