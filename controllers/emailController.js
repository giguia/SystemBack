const Email = require('../models/emailModel')
const mongoose = require('mongoose')
const { updateInventoryCounts } = require('./inventoryController')
const { Resend } = require('resend') // Import Resend library

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

/** --- GET ALL EMAILS FOR TELEMARKETER --- */
const getEmails = async (req, res) => {
    const userLG_id = req.userLG._id

    const emails = await Email.find({ userLG_id }).sort({ createdAt: -1 })

    res.status(200).json(emails)
}

/** --- FOR ADMIN/TEAM LEADER ONLY --- */
const getTLEmails = async (req, res) => {

    const emails = await Email.find({}).sort({ createdAt: -1 })

    res.status(200).json(emails)
}

/** --- GET A SINGLE EMAIL --- */
const getSingleEmail = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No email found' })
    }

    const email = await Email.findById(id)

    if (!email) {
        return res.status(404).json({ error: "No email found" })
    }

    res.status(200).json(email)
}

/** --- CREATE A NEW EMAIL --- */
const createEmail = async (req, res) => {
    const { from, to, subject, text } = req.body

    let emptyFields = []

    if (!from) {
        emptyFields.push('from')
    }
    if (!to) {
        emptyFields.push('to')
    }
    if (!subject) {
        emptyFields.push('subject')
    }
    if (!text) {
        emptyFields.push('text')
    }
    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all the fields', emptyFields })
    }

    // add doc to db
    try {
        const userLG_id = req.userLG._id
        const email = await Email.create({ from, to, subject, text, userLG_id })

        // Update inventory after creating email
        await updateInventoryCounts()

        // Send email using Resend API
        const data = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>", to: "sorianoivan13@gmail.com", subject, text
        })

        res.status(200).json({ email, data })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

/** --- DELETE EMAIL --- */
const deleteEmail = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No email found' })
    }

    const email = await Email.findOneAndDelete({ _id: id })

    if (!email) {
        return res.status(400).json({ error: 'No email found' })
    }

    // Update inventory after deleting email
    await updateInventoryCounts()

    res.status(200).json(email)
}

/** --- UPDATE EMAIL --- */
const updateEmail = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No email found' })
    }

    const email = await Email.findOneAndUpdate({ _id: id }, {
        ...req.body
    })

    if (!email) {
        return res.status(400).json({ error: 'No email found' })
    }

    res.status(200).json(email)
}

module.exports = {
    getEmails,
    getTLEmails,
    getSingleEmail,
    createEmail,
    deleteEmail,
    updateEmail
}
