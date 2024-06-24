const express = require('express')
const {
    getEmails,
    getTLEmails,
    getSingleEmail,
    createEmail,
    deleteEmail,
    updateEmail
} = require('../controllers/emailController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all lead routes
router.use(requireAuth)

/** --- ADMIN --- */
router.get('/tl', getTLEmails)

/** --- TELEMARKETER --- */
router.get('/', getEmails)

/** --- ALL  --- */
router.get('/:id', getSingleEmail) // GET a single email
router.post('/', createEmail) // POST a new email
router.delete('/:id', deleteEmail) // DELETE email
router.patch('/:id', updateEmail) // UPDATE email

module.exports = router
