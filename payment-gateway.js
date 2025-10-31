class PaymentGateway {
    constructor() {
        // The Razorpay Key is public and is fine to be here.
        // The secret key is used in the cloud function.
        this.razorpayKey = 'rzp_test_RYFI1lMqR1SvDA';
    }

    async initiatePayment(bookingData) {
        showToast('Initializing payment...', 'info');

        // VERY IMPORTANT: Replace this placeholder with the actual URL from your Firebase deployment
        const cloudFunctionUrl = 'PASTE_YOUR_CLOUD_FUNCTION_URL_HERE'; // e.g., https://us-central1-your-project-id.cloudfunctions.net/createRazorpayOrder

        if (cloudFunctionUrl === 'PASTE_YOUR_CLOUD_FUNCTION_URL_HERE') {
            showToast('Payment gateway is not configured. Please contact support.', 'error');
            console.error("Cloud function URL for Razorpay is not set.");
            return;
        }

        try {
            const orderResponse = await fetch(cloudFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: bookingData.amount })
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create Razorpay order.');
            }

            const order = await orderResponse.json();

            const user = auth.currentUser;
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};

            const options = {
                key: this.razorpayKey,
                amount: order.amount,
                currency: order.currency,
                name: 'Khatu Shyam Enterprises',
                description: `Booking ID: ${bookingData.bookingId}`,
                order_id: order.id,
                handler: async function(response) {
                    bookingData.paymentStatus = 'paid';
                    bookingData.paymentId = response.razorpay_payment_id;
                    bookingData.razorpayOrderId = response.razorpay_order_id;
                    bookingData.razorpaySignature = response.razorpay_signature;
                    bookingData.paidAt = firebase.firestore.FieldValue.serverTimestamp();
                    
                    showToast('Payment successful! Saving booking...', 'success');
                    await saveBooking(bookingData); // Assumes saveBooking is a global function
                },
                prefill: {
                    name: userData.name || '',
                    email: userData.email || '',
                    contact: user.phoneNumber
                },
                theme: {
                    color: '#1173d4'
                },
                modal: {
                    ondismiss: function(){
                        showToast('Payment cancelled.', 'warning');
                    }
                }
            };

            const razorpay = new Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Payment Initialization Error:', error);
            showToast('Could not initiate payment. Please try again.', 'error');
        }
    }
}
