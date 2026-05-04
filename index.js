// index.js
const express = require('express');
const cors = require('cors');

const trainRoutes = require('./routes/trainRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const authenticateToken = require('./middleware/authenticateToken');
const passwordRoutes = require('./routes/passwordRoutes');
const coachRoutes = require('./routes/coachRoutes');
require('./scheduler'); 

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.use('/api/users', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', authenticateToken, bookingRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/changepassword', passwordRoutes);//Middleware is at the route level because req at specific route
app.use('/api/coach', coachRoutes);
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, Railway-Management system');
});

app.listen(port, () => {
  console.log(`🚆 Server running on http://localhost:${port}`);
});
