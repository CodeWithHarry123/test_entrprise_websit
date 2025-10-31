class TrackingSystem {
    constructor(bookingId) {
        this.bookingId = bookingId;
        this.trackingRef = db.collection('tracking').doc(bookingId);
        this.map = null;
        this.marker = null;
    }

    initMap() {
        this.map = new google.maps.Map(document.getElementById('tracking-map'), {
            center: { lat: 20.5937, lng: 78.9629 }, // Default to India
            zoom: 5,
        });
    }

    startTracking() {
        this.initMap();
        this.trackingRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                this.updateMapMarker(data.latitude, data.longitude);
                this.updateStatus(data.status);
                this.updateETA(data.estimatedDelivery);
            } else {
                console.log("No tracking data found for this booking.");
                // Optionally, display a message to the user
            }
        });
    }

    updateMapMarker(lat, lng) {
        const position = new google.maps.LatLng(lat, lng);
        if (!this.marker) {
            this.marker = new google.maps.Marker({
                position: position,
                map: this.map,
                // icon: '/assets/delivery-truck.png' // Optional: custom icon
            });
        } else {
            this.marker.setPosition(position);
        }
        this.map.setCenter(position);
        this.map.setZoom(12);
    }

    updateStatus(status) {
        const statusElement = document.getElementById('tracking-status');
        if (!statusElement) return;
        const statusMap = {
            'picked': 'Parcel Picked Up',
            'in_transit': 'In Transit',
            'out_for_delivery': 'Out for Delivery',
            'delivered': 'Delivered'
        };
        statusElement.textContent = statusMap[status] || status;
    }

    updateETA(estimatedDelivery) {
        const etaElement = document.getElementById('tracking-eta');
        if (!etaElement) return;
        if (estimatedDelivery && estimatedDelivery.toDate) {
            etaElement.textContent = `Estimated Delivery: ${estimatedDelivery.toDate().toLocaleString()}`;
        } else {
            etaElement.textContent = 'Estimated Delivery: Not available';
        }
    }
}
