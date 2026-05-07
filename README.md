# 🚆 Yatra Guide – Smart Railway Reservation System

## 👨‍💻 Team Members

- Pratik Tiwari
- Nishant Mishra
- Markanday Bhardwaj
- Mantavya Kumar

---

# 📌 Project Overview

Yatra Guide is a smart railway reservation system developed to solve the problem of temporary seat blocking caused by incomplete or failed payment transactions.

The system introduces an automatic seat cancellation and restoration mechanism that releases reserved seats after a fixed timeout period. This improves seat utilization and maintains real-time availability.

---

# ⚙️ Key Features

- 🔐 User Authentication using JWT
- 🎫 Train Booking System
- ⏱️ Auto-Cancellation of Unpaid Bookings
- 💺 Automatic Seat Restoration
- 📊 Real-Time Seat Availability
- 🧠 Scheduler using node-cron
- 🗄️ MySQL Database Integration
- 🏗️ Modular Client–Server Architecture

---

# 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Scheduler | node-cron |
| Authentication | JWT + bcrypt |

---

# 📂 Project Structure

```text
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

# 🗄️ Database Schema

## Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);
```

---

## Trains Table

```sql
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
```

---

## Bookings Table

```sql
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
```

---

# 🔁 Auto-Cancellation Logic

The scheduler runs automatically using `node-cron`.

## Conditions Checked

```sql
payment_status = 'pending'
status = 'active'
created_at < NOW() - INTERVAL 3 MINUTE
```

## Actions Performed

- Booking status updated to `cancelled`
- Seat restored in `trains` table
- Seat availability updated automatically

---

# 🚀 How to Run the Project

## 🔧 Prerequisites

- Node.js
- MySQL
- Git

---

## 📥 Step 1: Clone Repository

```bash
git clone https://github.com/your-username/yatra-guide.git

cd yatra-guide
```

---

## ⚙️ Step 2: Setup Backend

```bash
cd backend

npm install
```

### Configure Database (`config/db.js`)

```javascript
const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'railway_db'
});

module.exports = db.promise();
```

---

## 🗄️ Step 3: Setup Database

Open MySQL and run:

```sql
CREATE DATABASE railway_db;

USE railway_db;
```

Then execute all table creation queries.

---

## ▶️ Step 4: Start Backend

```bash
node index.js
```

Expected Output:

```text
🚆 Server running on http://localhost:3000
```

---

## 🌐 Step 5: Start Frontend

```bash
cd ../frontend

npm install

npm start
```

---

# 📊 Testing Auto-Cancellation

1. Create a booking with:
   - `payment_status = 'pending'`

2. Wait for 3 minutes

3. Scheduler automatically:
   - Cancels booking
   - Restores seats
   - Updates database records

---

# 📈 Performance Metrics

| Metric | Result |
|---|---|
| Seat Restoration Latency (SRL) | 4–19 ms |
| Cancellation Timeout | 180–200 sec |
| Booking Response | Stable during testing |

---

# 📌 Future Enhancements

- ☁️ Cloud Deployment (AWS / GCP)
- ⚖️ Load Balancer Integration
- 🗃️ Database Replication
- 📱 Mobile Application Support
