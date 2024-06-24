const BookedUnits = require('../models/BookedUnitsModel');
const RecentBooking = require('../models/recentBookingModel');
const Lead = require('../models/leadModel');
const mongoose = require('mongoose');
const UserLG = require('../models/userLGModel');
const Email = require('../models/emailModel');

const getBookedUnitsPerformance = async (req, res) => {
    try {
        const performanceData = await updateBookedUnits();
        res.status(200).json(performanceData);
    } catch (error) {
        console.error('Error fetching booked units performance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateBookedUnits = async () => {
    try {
        const allTelemarketers = await UserLG.find({ role: 'Telemarketer' }); // Fetch all telemarketer users
        const performanceData = [];

        // Define all possible types
        const typeEnum = [
            "Warehouse", "Restaurant", "Boutiques", "Salon", "Spa",
            "Manufacturing", "Hotel", "Gym", "Automotive", "Cafe",
            "Brewery", "Pet Shops", "Laundry", "Clinic"
        ];

        // Define all possible call dispositions
        const callDispositionEnum = [
            "Not Eligible", "Already Installed", "Wrong/Not Working", "Booked", "Residential",
            "Callback", "Do Not Call", "No Answer", "Not Interested", "Voicemail", "Warm Lead", "Email"
        ];

        await Promise.all(allTelemarketers.map(async (telemarketer) => {
            const telemarketerName = telemarketer.name;

            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfToday = new Date(today.setHours(0, 0, 0, 0));
            const endOfToday = new Date(today.setHours(23, 59, 59, 999));
            const startOfYesterday = new Date(today);
            startOfYesterday.setDate(startOfToday.getDate() - 1);
            startOfYesterday.setHours(0, 0, 0, 0);
            const endOfYesterday = new Date(startOfYesterday);
            endOfYesterday.setHours(23, 59, 59, 999);

            const dailyBookings = await RecentBooking.countDocuments({
                telemarketerName,
                createdAt: {
                    $gte: startOfToday,
                    $lt: endOfToday
                }
            });

            const monthlyBookings = await RecentBooking.countDocuments({
                telemarketerName,
                createdAt: { $gte: firstDayOfMonth }
            });

            const totalBookings = await RecentBooking.countDocuments({ telemarketerName });

            // Calculate the total number of leads assigned to this telemarketer
            const totalAssignedLeads = await Lead.countDocuments({ assignedTo: telemarketer._id });

            // Calculate the number of leads assigned to this telemarketer today
            const assignedDaily = await Lead.countDocuments({
                assignedTo: telemarketer._id,
                Distributed: {
                    $gte: startOfToday,
                    $lt: endOfToday
                }
            });

            // Calculate the number of leads assigned to this telemarketer yesterday
            const assignedYesterday = await Lead.countDocuments({
                assignedTo: telemarketer._id,
                Distributed: {
                    $gte: startOfYesterday,
                    $lt: endOfYesterday
                }
            });

            // Calculate the number of leads tracked by this telemarketer
            const assignedLeadStatus = await Lead.countDocuments({
                assignedTo: telemarketer._id,
                callDisposition: { $exists: true, $ne: null },
                remarks: { $exists: true, $ne: null }
            });

            // Calculate the number of leads without callDisposition
            const assignedLeadsAvailable = await Lead.countDocuments({
                assignedTo: telemarketer._id,
                callDisposition: { $exists: false }
            });

            // Calculate the number of leads tracked by this telemarketer today
            const leadTracked = await Lead.countDocuments({
                assignedTo: telemarketer._id,
                updatedAt: {
                    $gte: startOfToday,
                    $lt: endOfToday
                },
                callDisposition: { $exists: true, $ne: null },
                remarks: { $exists: true, $ne: null }
            });

            // Initialize typesReceived with all types set to 0
            const typesReceivedObj = typeEnum.reduce((acc, type) => {
                acc[type] = 0;
                return acc;
            }, {});

            // Count the number of assigned leads for each type
            const typesReceived = await Lead.aggregate([
                { $match: { assignedTo: telemarketer._id } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]);

            // Update the counts in typesReceivedObj
            typesReceived.forEach(({ _id, count }) => {
                if (_id) {
                    typesReceivedObj[_id] = count;
                }
            });

            const typesReceivedDailyObj = typeEnum.reduce((acc, type) => {
                acc[type] = 0;
                return acc;
            }, {});

            const typesReceivedDaily = await Lead.aggregate([
                { $match: { assignedTo: telemarketer._id, updatedAt: { $gte: startOfToday, $lt: endOfToday } } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]);

            typesReceivedDaily.forEach(({ _id, count }) => {
                if (_id) {
                    typesReceivedDailyObj[_id] = count;
                }
            });

            // Initialize callDispositionCreated with all call dispositions set to 0
            const callDispositionCreatedObj = callDispositionEnum.reduce((acc, disposition) => {
                acc[disposition] = 0;
                return acc;
            }, {});

            // Count the number of leads for each callDisposition created by this telemarketer
            const callDispositions = await Lead.aggregate([
                { $match: { assignedTo: telemarketer._id } },
                { $group: { _id: '$callDisposition', count: { $sum: 1 } } }
            ]);

            // Update the counts in callDispositionCreatedObj
            callDispositions.forEach(({ _id, count }) => {
                if (_id) {
                    callDispositionCreatedObj[_id] = count;
                }
            });

            const callDispositionDailyObj = callDispositionEnum.reduce((acc, disposition) => {
                acc[disposition] = 0;
                return acc;
            }, {});

            const callDispositionsToday = await Lead.aggregate([
                { $match: { assignedTo: telemarketer._id, updatedAt: { $gte: startOfToday, $lt: endOfToday } } },
                { $group: { _id: '$callDisposition', count: { $sum: 1 } } }
            ]);

            callDispositionsToday.forEach(({ _id, count }) => {
                if (_id) {
                    callDispositionDailyObj[_id] = count;
                }
            });

            // Count the number of emails sent by this telemarketer
            const emailsSent = await Email.countDocuments({ userLG_id: telemarketer._id });

            const bookedUnits = await BookedUnits.findOneAndUpdate(
                { telemarketerName },
                {
                    telemarketerName,
                    bookedDaily: dailyBookings,
                    bookedMonth: monthlyBookings,
                    totalBooked: totalBookings,
                    totalAssignedLeads,
                    assignedDaily,
                    assignedYesterday,
                    assignedLeadStatus,
                    leadTracked,
                    typesReceived: typesReceivedObj,
                    typesReceivedDaily: typesReceivedDailyObj,
                    callDispositionCreated: callDispositionCreatedObj,
                    assignedLeadsAvailable,
                    callDispositionDaily: callDispositionDailyObj,
                    emailsSent
                },
                { new: true, upsert: true }
            );

            performanceData.push(bookedUnits);
        }));

        // Sort the performance data by createdAt in descending order
        performanceData.sort((a, b) => b.createdAt - a.createdAt);

        return performanceData;
    } catch (error) {
        console.error('Error updating booked units:', error);
        throw error;
    }
};


module.exports = { getBookedUnitsPerformance, updateBookedUnits };
