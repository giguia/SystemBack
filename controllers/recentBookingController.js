const RecentBooking = require('../models/recentBookingModel')

const getRecentBookings = async (req, res) => {
    try {
        const recentBookings = await RecentBooking.find().populate('lead').sort({ createdAt: -1 })
        res.status(200).json(recentBookings)
    } catch (error) {
        console.error('Error fetching recent bookings:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

module.exports = { getRecentBookings }