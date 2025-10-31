'''// notification-service.js
class NotificationService {
    static async sendBookingConfirmation(bookingId, userData) {
        // Use Firebase Cloud Functions + Twilio/MSG91 for SMS
        const functions = firebase.functions();
        const sendNotification = functions.httpsCallable('sendNotification');
        
        try {
            await sendNotification({
                type: 'booking_confirmation',
                bookingId: bookingId,
                phone: userData.phone,
                email: userData.email,
                message: `Your booking ${bookingId} has been confirmed. Track at: https://yourdomain.com/track/${bookingId}`
            });
        } catch (error) {
            console.error('Notification failed:', error);
        }
    }
    
    static async sendStatusUpdate(bookingId, status) {
        const functions = firebase.functions();
        const sendNotification = functions.httpsCallable('sendNotification');
        
        const booking = await db.collection('bookings').doc(bookingId).get();
        const userData = booking.data();
        
        await sendNotification({
            type: 'status_update',
            bookingId: bookingId,
            phone: userData.phone,
            status: status,
            message: `Your parcel ${bookingId} status: ${status}`
        });
    }
}
'''