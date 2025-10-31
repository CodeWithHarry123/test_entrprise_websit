class AdminAnalytics {
    async getDashboardData() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Get bookings data for the current month
        const bookingsSnapshot = await db.collection('bookings')
            .where('bookingDate', '>=', startOfMonth)
            .get();

        const allBookingsSnapshot = await db.collection('bookings').get();
        const usersSnapshot = await db.collection('users').get();

        const analytics = {
            totalBookings: allBookingsSnapshot.size,
            totalUsers: usersSnapshot.size,
            totalRevenue: 0,
            pendingDeliveries: 0,
            completedDeliveries: 0,
            cancelledBookings: 0,
            averageDeliveryTime: 0, // This would require more complex logic
            topRoutes: {},
            revenueByDay: {},
            bookingsByMonth: {},
            usersByMonth: {}
        };

        allBookingsSnapshot.forEach(doc => {
            const data = doc.data();
            analytics.totalRevenue += data.amount || 0;

            if (data.status === 'Delivered') analytics.completedDeliveries++;
            else if (data.status === 'Cancelled') analytics.cancelledBookings++; // Assuming 'Cancelled' is a possible status
            else analytics.pendingDeliveries++;

            const route = `${data.senderDetails.pincode} → ${data.receiverDetails.pincode}`;
            analytics.topRoutes[route] = (analytics.topRoutes[route] || 0) + 1;

            if (data.bookingDate) {
                const date = data.bookingDate.toDate();
                const day = date.toLocaleDateString();
                analytics.revenueByDay[day] = (analytics.revenueByDay[day] || 0) + data.amount;

                const month = date.toLocaleString('default', { month: 'short' });
                analytics.bookingsByMonth[month] = (analytics.bookingsByMonth[month] || 0) + 1;
            }
        });

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) {
                const date = data.createdAt.toDate();
                const month = date.toLocaleString('default', { month: 'short' });
                analytics.usersByMonth[month] = (analytics.usersByMonth[month] || 0) + 1;
            }
        });

        return analytics;
    }

    renderDashboard(analytics) {
        // Update dashboard cards
        document.getElementById('total-bookings').textContent = analytics.totalBookings;
        document.getElementById('total-users').textContent = analytics.totalUsers;
        document.getElementById('total-revenue').textContent = `₹${analytics.totalRevenue.toFixed(2)}`;
        document.getElementById('total-delivered').textContent = analytics.completedDeliveries;
        document.getElementById('total-pending').textContent = analytics.pendingDeliveries;
        document.getElementById('total-cancelled').textContent = analytics.cancelledBookings;

        // Render charts (using Chart.js)
        this.renderRevenueChart(analytics.revenueByDay);
        this.renderRoutesChart(analytics.topRoutes);
        this.renderBookingsChart(analytics.bookingsByMonth);
        this.renderUsersChart(analytics.usersByMonth);
    }

    renderRevenueChart(revenueData) {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(revenueData),
                datasets: [{
                    label: 'Daily Revenue (₹)',
                    data: Object.values(revenueData),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue Trend (This Month)'
                    }
                }
            }
        });
    }

    renderRoutesChart(routesData) {
        const sortedRoutes = Object.entries(routesData).sort(([,a],[,b]) => b-a).slice(0, 10);
        const ctx = document.getElementById('routes-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedRoutes.map(item => item[0]),
                datasets: [{
                    label: 'Number of Bookings',
                    data: sortedRoutes.map(item => item[1]),
                    backgroundColor: 'rgba(255, 159, 64, 0.8)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 Routes'
                    }
                }
            }
        });
    }

    renderBookingsChart(bookingsData) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map(month => bookingsData[month] || 0);
        const ctx = document.getElementById('bookings-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Bookings',
                    data: data,
                    backgroundColor: 'rgba(26, 58, 109, 0.8)',
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Bookings'
                    }
                }
            }
        });
    }

    renderUsersChart(usersData) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map(month => usersData[month] || 0);
        const ctx = document.getElementById('users-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'New Users',
                    data: data,
                    borderColor: 'rgba(255, 193, 7, 1)',
                    tension: 0.4
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly User Registrations'
                    }
                }
            }
        });
    }
}
