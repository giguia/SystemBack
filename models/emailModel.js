const mongoose = require('mongoose')

const Schema = mongoose.Schema

const emailSchema = new Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  userLG_id: {
    type: String,
    required: true
  },
}, { timestamps: true })

module.exports = mongoose.model('Email', emailSchema)