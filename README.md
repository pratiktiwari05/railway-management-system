🚆 Yatra Guide – Smart Railway Reservation System
👨‍💻 Team Members
Pratik Tiwari
Nishant Mishra
Markanday Bhardwaj
Mantavya Kumar
📌 Project Overview

Yatra Guide is a smart railway reservation system designed to solve the common problem of seat blocking caused by incomplete payment transactions.

The system introduces an automated cancellation mechanism that releases seats after a fixed timeout, ensuring efficient seat utilization and real-time availability.

⚙️ Key Features
🔐 User Authentication (Register/Login with JWT)
🎫 Train Booking System
⏱️ Auto-Cancellation of Unpaid Bookings (3-minute timeout)
💺 Seat Restoration Logic (SL, 3AC, 2AC, 1AC)
📊 Real-time Seat Availability
🧠 Scheduler using node-cron
🗄️ MySQL Database Integration
🏗️ Tech Stack
Layer	Technology
Frontend	React.js
Backend	Node.js + Express
Database	MySQL
Scheduler	node-cron
Auth	JWT + bcrypt
yatra-guide/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── trainRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── passwordRoutes.js
│   │   └── coachRoutes.js
│   │
│   ├── middleware/
│   │   └── authenticateToken.js
│   │
│   ├── scheduler.js
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── package.json
│
└── README.md

🗄️ Database Schema
1. Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);
2. Trains Table
CREATE TABLE trains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  train_name VARCHAR(100),
  from_station VARCHAR(100),
  to_station VARCHAR(100),
  available_seats INT,
  sl_seats INT,
  ac3_seats INT,
  ac2_seats INT,
  ac1_seats INT
);
3. Bookings Table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trainId INT,
  train VARCHAR(100),
  passenger VARCHAR(100),
  seat VARCHAR(20),
  user_id INT,
  payment_status VARCHAR(20) DEFAULT 'pending',
  class_type VARCHAR(10),
  age INT,
  passenger_from_station VARCHAR(100),
  passenger_to_station VARCHAR(100),
  journey_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainId) REFERENCES trains(id)
);

🔁 Auto-Cancellation Logic
Every 1 minute, the scheduler runs
If:
payment_status = 'pending'
status = 'active'
created_at < NOW() - INTERVAL 3 MINUTE

👉 Then:

Booking → cancelled
Seat → restored in trains table
🚀 How to Run the Project
🔧 Prerequisites
Node.js installed
MySQL installed
Git installed
📥 Step 1: Clone the Repository
git clone https://github.com/your-username/yatra-guide.git
cd yatra-guide
⚙️ Step 2: Setup Backend
cd backend
npm install
Configure DB (config/db.js)
const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'railway_db'
});

module.exports = db.promise();
🗄️ Step 3: Setup Database

Open MySQL and run:

CREATE DATABASE railway_db;
USE railway_db;

/* Run all table creation queries here */
▶️ Step 4: Start Backend
node index.js

You should see:

🚆 Server running on http://localhost:3000
🌐 Step 5: Setup Frontend
cd ../frontend
npm install
npm start
📊 Testing Auto-Cancellation
Create booking with payment_status = pending
Wait 3 minutes
Scheduler will:
Cancel booking
Restore seat
Log SRL in terminal
📈 Performance Metrics
Seat Restoration Latency (SRL): 4–19 ms
Cancellation Delay: 180–200 sec
Stable performance across 10, 50, 100 requests
📌 Future Enhancements
Cloud Deployment (AWS / GCP)
Load Balancer Integration
Redis + Bull Queue (parallel jobs)
Kafka/RabbitMQ (event-driven system)
Database Replication
 Acknowledgement
Crafted with ❤️ by Team Yatra Guide
📬 Contact

For queries or collaboration:

Pratik Tiwari
