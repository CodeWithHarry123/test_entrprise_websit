const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Razorpay = require('razorpay');
const cors = require('cors')({origin: true});

admin.initializeApp();

// Initialize Razorpay with Test Keys
// IMPORTANT: For production, set your keys using Firebase environment variables for security.
// Run in your terminal: 
// firebase functions:config:set razorpay.key_id="YOUR_KEY_ID"
// firebase functions:config:set razorpay.key_secret="YOUR_KEY_SECRET"
const razorpayInstance = new Razorpay({
    key_id: functions.config().razorpay ? functions.config().razorpay.key_id : 'rzp_test_RYFI1lMqR1SvDA',
    key_secret: functions.config().razorpay ? functions.config().razorpay.key_secret : 'c2ZFO7XqXFhlP8ssmr1Gq6gm'
});


// --- Function to create a Razorpay Order ---
exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
    // Handling CORS
    cors(req, res, async () => {
        if(req.method !== 'POST') {
            return res.status(400).send('Please send a POST request');
        }

        try {
            const amount = req.body.amount;
            if (!amount) {
                return res.status(400).send('Amount is required');
            }

            const options = {
                amount: amount * 100, // amount in the smallest currency unit (paise)
                currency: "INR",
                receipt: `receipt_order_${new Date().getTime()}`
            };

            const order = await razorpayInstance.orders.create(options);
            console.log("Razorpay Order Created:", order);
            return res.status(200).json(order);

        } catch (error) {
            console.error("Error creating Razorpay order:", error);
            return res.status(500).send("Error creating Razorpay order. Check function logs for details.");
        }
    });
});


// WARNING: Replace with your actual credentials and configuration
// For Gmail, you may need to use an "App Password" if you have 2-Step Verification enabled.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // TODO: Replace with your Gmail address
        pass: 'your-app-password'    // TODO: Replace with your Gmail App Password
    }
});

// WARNING: Replace with your actual Twilio credentials
const twilioClient = twilio(
    'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // TODO: Replace with your Twilio Account SID
    'your_auth_token'                // TODO: Replace with your Twilio Auth Token
);

const TWILIO_PHONE_NUMBER = '+1234567890'; // TODO: Replace with your Twilio phone number

// --- Function to send notifications on new booking creation ---
exsports.onBookingCreated = functions.firestore
    .document('bookings/{bookingId}')
    .onCreate(async (snap, context) => {
        const booking = snap.data();
        const bookingId = context.params.bookingId;

        // Get the user data to find their phone number and email
        const userRef = admin.firestore().collection('users').doc(booking.userId);
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            console.log(`User with ID ${booking.userId} not found.`);
            return;
        }
        const userData = userSnap.data();

        // --- Send SMS Notification via Twilio ---
        if (userData.phoneNumber) {
            try {
                await twilioClient.messages.create({
                    body: `Khatu Shyam Ent: Booking confirmed! Your Tracking ID is ${booking.bookingId || bookingId}. Track at: https://yoursite.com/track?id=${bookingId}`,
                    from: TWILIO_PHONE_NUMBER,
                    to: userData.phoneNumber
                });
                console.log(`SMS sent successfully to ${userData.phoneNumber}`);
            } catch (error) {
                console.error(`Error sending SMS to ${userData.phoneNumber}:`, error);
            }
        }

        // --- Send Email Notification via Nodemailer ---
        if (userData.email) {
            const mailOptions = {
                from: 'Khatu Shyam Enterprises <noreply@yourdomain.com>', // TODO: Update with your domain
                to: userData.email,
                subject: `Booking Confirmation - ${booking.bookingId || bookingId}`,
                html: `
                    <h2>Booking Confirmed!</h2>
                    <p>Dear ${userData.name || 'Customer'},</p>
                    <p>Your parcel booking has been confirmed.</p>
                    <p><strong>Tracking ID:</strong> ${booking.bookingId || bookingId}</p>
                    <p><strong>Pickup:</strong> ${booking.senderDetails.address}</p>
                    <p><strong>Delivery:</strong> ${booking.receiverDetails.address}</p>
                    <a href="https://yoursite.com/track?id=${bookingId}">Track Your Parcel</a>
                `
            };
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent successfully to ${userData.email}`);
            } catch (error) {
                console.error(`Error sending email to ${userData.email}:`, error);
            }
        }
    });

// --- Function to send notifications on booking status update ---
exsports.onStatusUpdate = functions.firestore
    .document('bookings/{bookingId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        // Send notification only if the status has actually changed
        if (before.status !== after.status) {
            const userId = after.userId;
            const userRef = admin.firestore().collection('users').doc(userId);
            const userSnap = await userRef.get();

            if (!userSnap.exists) {
                console.log(`User with ID ${userId} not found.`);
                return;
            }
            const userData = userSnap.data();

            // --- Send SMS Notification for status update ---
            if (userData.phoneNumber) {
                try {
                    await twilioClient.messages.create({
                        body: `Khatu Shyam Ent: Your parcel with ID ${after.bookingId || context.params.bookingId} is now '${after.status}'.`,
                        from: TWILIO_PHONE_NUMBER,
                        to: userData.phoneNumber
                    });
                    console.log(`Status update SMS sent to ${userData.phoneNumber}`);
                } catch (error) {
                    console.error(`Error sending status update SMS to ${userData.phoneNumber}:`, error);
                }
            }
            
            // TODO: You can also add an email notification for status updates here if needed.
        }
    });
