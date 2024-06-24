const mongoose = require('mongoose')

const Schema = mongoose.Schema

// Define enum for the types
const typeEnum = ["Warehouse", "Restaurant", "Boutiques", "Salon", "Spa", "Manufacturing", "Hotel", "Gym", "Automotive", "Cafe", "Brewery", "Pet Shops", "Laundry", "Clinic"];
const callDispositionEnum = ["Not Eligible", "Already Installed", "Wrong/Not Working", "Booked", "Residential", "Callback", "Do Not Call", "No Answer", "Not Interested", "Voicemail", "Warm Lead", "Email"]

const leadSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: typeEnum // Define the enum here
    },
    phonenumber: {
        type: String
    },
    streetaddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postcode: {
        type: String,
        required: true
    },
    emailaddress: {
        type: String
    },
    userLG_id: {
        type: String,
        required: true
    },
    callDisposition: {
        type: String,
        enum: callDispositionEnum
    },
    remarks: {
        type: String
    },
    assignedTo: {
        type: Schema.Types.ObjectId, // Reference to Telemarketer user
        ref: 'UserLG' // Reference to the UserLG model
    },
    Distributed: {
        type: Date
    }
}, { timestamps: true })

module.exports = mongoose.model('Lead', leadSchema)
