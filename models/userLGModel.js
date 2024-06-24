const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

// define enum for the roles
const roleEnum = ["Lead Generation", "Telemarketer", "Team Leader"]
const genderEnum = ["Male", "Female"]

const userLGSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: roleEnum // Define the enum here
  },
  birthday: {
    type: Date // Date type for storing birthdays
  },
  number: {
    type: String
  },
  homeaddress: {
    type: String
  },
  gender: {
    type: String,
    enum: genderEnum // Define the enum here
  },
  isActive: {
    type: Boolean,
    default: false  // Initially set to false (not active)
  }
}, { timestamps: true })

// static signup method
userLGSchema.statics.signup = async function (name, email, password, role) {

  // validation
  if (!name || !email || !password || !role) {
    throw Error('All fields must be filled')
  }
  if (!validator.isEmail(email)) {
    throw Error('Email not valid')
  }
  if (!validator.isStrongPassword(password)) {
    throw Error('Password not strong enough')
  }

  const exists = await this.findOne({ email })

  if (exists) {
    throw Error('Email already in use')
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const userLG = await this.create({ name, email, password: hash, role })

  return userLG
}

// static login method
userLGSchema.statics.login = async function (email, password) {

  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  const userLG = await this.findOne({ email })
  if (!userLG) {
    throw Error('Incorrect email')
  }

  const match = await bcrypt.compare(password, userLG.password)
  if (!match) {
    throw Error('Incorrect password')
  }

  return userLG
}

module.exports = mongoose.models.UserLG || mongoose.model('UserLG', userLGSchema)
