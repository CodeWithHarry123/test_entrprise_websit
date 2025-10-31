class PriceCalculator {
    constructor() {
        this.baseRate = 50; // Base charge
        this.perKmRate = 8; // Per km rate
        this.weightCharges = {
            '0-5': 0,
            '5-10': 50,
            '10-20': 100,
            '20+': 200
        };
    }

    async calculatePrice(pickupPincode, deliveryPincode, weight) {
        try {
            // Get distance using Google Distance Matrix API
            const distance = await this.getDistance(pickupPincode, deliveryPincode);

            if (distance === null) {
                return null;
            }

            // Calculate base price
            let price = this.baseRate + (distance * this.perKmRate);

            // Add weight charges
            price += this.getWeightCharge(weight);

            // Add GST (18%)
            const gst = price * 0.18;
            const total = price + gst;

            return {
                basePrice: price.toFixed(2),
                gst: gst.toFixed(2),
                total: total.toFixed(2),
                distance: distance.toFixed(2)
            };
        } catch (error) {
            console.error('Price calculation error:', error);
            return null;
        }
    }

    async getDistance(origin, destination) {
        // IMPORTANT: You need to have the Google Maps JavaScript API script included in your HTML
        // with a valid API key for this to work.
        const service = new google.maps.DistanceMatrixService();

        return new Promise((resolve, reject) => {
            service.getDistanceMatrix({
                origins: [origin],
                destinations: [destination],
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.METRIC
            }, (response, status) => {
                if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                    const distanceInMeters = response.rows[0].elements[0].distance.value;
                    resolve(distanceInMeters / 1000); // Convert to km
                } else {
                    console.error('Distance Matrix API call failed with status:', status, response);
                    reject('Distance calculation failed. Please check the PIN codes.');
                }
            });
        });
    }

    getWeightCharge(weight) {
        if (weight <= 5) return this.weightCharges['0-5'];
        if (weight <= 10) return this.weightCharges['5-10'];
        if (weight <= 20) return this.weightCharges['10-20'];
        return this.weightCharges['20+'];
    }
}
