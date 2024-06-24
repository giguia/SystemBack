const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const leadGenPerformanceSchema = new Schema({
    leadGenName: {
        type: String,
        required: true
    },
    leadsCreated: {
        type: String,
        required: true
    },
    leadsAssigned: {
        type: String,
        required: true
    },
    leadsAvailable: {
        type: String,
        required: true
    },
    typesCreated: {
        type: Map, // Use Map to store key-value pairs
        of: Number, // Define the type of the values as Number
        required: true
    },
    leadsCreatedToday: { // Add the new field
        type: String,
        default: 0 // Initialize with 0
    }
}, { timestamps: true });

module.exports = mongoose.model('LeadGenPerformance', leadGenPerformanceSchema)