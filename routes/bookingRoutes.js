const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/authenticateToken');


//  1. USER BOOKINGS 
router.get('/user', authenticateToken, async (req, res) => {
  console.log(" req.user:", req.user);

  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT 
        b.id, b.seat, b.passenger, b.payment_status, b.status, b.class_type,
        t.train_name AS train
      FROM bookings b
      JOIN trains t ON b.trainId = t.id
      WHERE b.user_id = ?
      AND b.status = 'active'
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error(" SQL Error:", err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});


//  2. GET ALL BOOKINGS
router.get('/', async (req, res) => {
  try {
    const [bookings] = await db.query('SELECT * FROM bookings');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//  3. CREATE BOOKING
router.post('/', authenticateToken, async (req, res) => {
  const {
    trainId,
    train,
    passenger,
    seat,
    age,
    fromStation,
    toStation,
    journeyDate,
    payment_status = 'pending',
    classType
  } = req.body;

  const user_id = req.user?.id;

  if (!trainId || !passenger || !seat || !classType || !age || !fromStation || !toStation || !journeyDate) {
    return res.status(400).json({ message: 'Missing values' });
  }

  try {
    const classColumn = {
      SL: 'sl_seats',
      '3AC': 'ac3_seats',
      '2AC': 'ac2_seats',
      '1AC': 'ac1_seats',
    }[classType];

    if (!classColumn) {
      return res.status(400).json({ message: 'Invalid class type' });
    }

    const [[trainDetails]] = await db.query(
      `SELECT ${classColumn}, available_seats FROM trains WHERE id = ?`,
      [trainId]
    );

    if (!trainDetails) {
      return res.status(404).json({ message: 'Train not found' });
    }

    if (trainDetails[classColumn] <= 0 || trainDetails.available_seats <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    const [result] = await db.query(
      `INSERT INTO bookings 
      (trainId, train, passenger, seat, user_id, payment_status, class_type, age, passenger_from_station, passenger_to_station, journey_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trainId,
        train,
        passenger,
        seat,
        user_id,
        payment_status,
        classType,
        age,
        fromStation,
        toStation,
        journeyDate
      ]
    );

    await db.query(
      `UPDATE trains 
       SET ${classColumn} = ${classColumn} - 1,
           available_seats = available_seats - 1
       WHERE id = ?`,
      [trainId]
    );

    const newBooking = {
      id: result.insertId,
      trainId,
      train,
      passenger,
      seat,
      age,
      fromStation,
      toStation,
      journeyDate,
      user_id,
      payment_status,
      classType,
      status: 'active',
      created_at: new Date()
    };

    res.status(201).json({
      message: 'Booking Created',
      booking: newBooking
    });

  } catch (error) {
    console.error('Error during booking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//  4. PAYMENT
router.patch('/:id/pay', async (req, res) => {
  const bookingid = parseInt(req.params.id);

  try {
    const [results] = await db.query('SELECT * FROM bookings WHERE id = ?', [bookingid]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await db.query(
      'UPDATE bookings SET payment_status = ? WHERE id = ?',
      ['completed', bookingid]
    );

    res.json({ message: 'Payment marked as completed' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


//  5. DELETE BOOKING
router.delete('/:id', async (req, res) => {
  const bookingid = parseInt(req.params.id);

  try {
    const [booking] = await db.query('SELECT trainId FROM bookings WHERE id=?', [bookingid]);
    if (booking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const trainId = booking[0].trainId;

    await db.query('DELETE FROM bookings WHERE id=?', [bookingid]);

    await db.query(
      'UPDATE trains SET available_seats = available_seats + 1 WHERE id = ?',
      [trainId]
    );

    res.json({ message: 'Booking deleted and seat restored' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//  6. GET BY ID (ALWAYS LAST)
router.get('/:id', async (req, res) => {
  try {
    const bid = req.params.id;
    const [results] = await db.query('SELECT * FROM bookings WHERE id=?', [bid]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;