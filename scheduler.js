const cron = require('node-cron');
const db = require('./config/db');

const formatTime = (date = new Date()) => {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false
  }) + "." + String(date.getMilliseconds()).padStart(3, '0');
};

cron.schedule('* * * * *', async () => {

  try {
    const [expiredBookings] = await db.query(`
      SELECT * FROM bookings 
      WHERE payment_status = 'pending' 
      AND status = 'active'
      AND created_at < NOW() - INTERVAL 3 MINUTE
    `);

    if (expiredBookings.length === 0) {
      console.log("No expired bookings\n");
      return;
    }

    for (const booking of expiredBookings) {

      console.log("========================================");
      console.log(`Booking ID: ${booking.id}`);

      // DB time
      console.log(`Booked At:                  ${booking.created_at}`);

      // Trigger time
      const triggerTime = new Date();
      const startTime = Date.now();
      console.log(`Auto-Cancel Triggered At:   ${formatTime(triggerTime)}`);

      // Class mapping
      const classMap = {
        'SL': 'sl_seats',
        '3AC': 'ac3_seats',
        '2AC': 'ac2_seats',
        '1AC': 'ac1_seats'
      };

      const classColumn = classMap[booking.class_type];

      if (!classColumn) {
        console.log(`Invalid class type: ${booking.class_type}`);
        console.log("========================================\n");
        continue;
      }

      // CREATE CONNECTION HERE
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        // Cancel booking
        const [cancelResult] = await connection.query(`
          UPDATE bookings 
          SET status = 'cancelled'
          WHERE id = ? AND status = 'active'
        `, [booking.id]);

        if (cancelResult.affectedRows === 0) {
          console.log("Already processed / skipped");
          await connection.rollback();
          continue;
        }

        const cancelTime = new Date();
        console.log(`Cancelled At:               ${formatTime(cancelTime)}`);

        // Restore seat
        await connection.query(`
          UPDATE trains
          SET ${classColumn} = ${classColumn} + 1,
              available_seats = available_seats + 1
          WHERE id = ?
        `, [booking.trainId]);

        const restoreTime = new Date();
        console.log(`Seat Restored At:           ${formatTime(restoreTime)}`);

        await connection.commit();

        // Metrics
        const endTime = Date.now();
        const createdAt = new Date(booking.created_at);

        const totalDelay = (cancelTime - createdAt) / 1000;
        const latency = endTime - startTime;

        console.log("\nMetrics:");
        console.log(`  Total Cancellation Delay: ${totalDelay.toFixed(2)} sec`);
        console.log(`  SRL (Latency):            ${latency} ms`);

      } catch (err) {
        await connection.rollback();
        console.error("Transaction failed:", err);
      } finally {
        connection.release();
      }

      console.log("========================================\n");
    }

  } catch (err) {
    console.error("Scheduler Error:", err);
  }

});