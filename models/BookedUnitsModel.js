const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookedUnitsSchema = new Schema({
    telemarketerName: {
        type: String,
        required: true
    },
    bookedDaily: {
        type: String,
        default: 0
    },
    bookedMonth: {
        type: String,
        default: 0
    },
    totalBooked: {
        type: String,
        default: 0
    },
    totalAssignedLeads: {
        type: String,
        default: 0
    },
    assignedDaily: {
        type: String,
        default: 0
    },
    assignedYesterday: {
        type: String,
        default: 0
    },
    leadTracked: {
        type: String,
        default: 0
    },
    assignedLeadStatus: { // Add this field
        type: String,
        default: 0
    },
    assignedLeadsAvailable: {
        type: String,
        default: 0
    },
    typesReceived: {
        type: Map, // Use Map to store key-value pairs
        of: Number, // Define the type of the values as Number
        default: {} // Initialize with an empty object
    },
    typesReceivedDaily: {
        type: Map, // Use Map to store key-value pairs
        of: Number, // Define the type of the values as Number
        default: {} // Initialize with an empty object
    },
    callDispositionCreated: {
        type: Map, // Use Map to store key-value pairs
        of: Number, // Define the type of the values as Number
        default: {} // Initialize with an empty object
    },
    callDispositionDaily: {
        type: Map,
        of: Number,
        default: {}
    },
    emailsSent: { // Add this field
        type: String,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('BookedUnits', bookedUnitsSchema);
