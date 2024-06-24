const express = require('express')

// controller functions
const {
    signupUserLG,
    loginUserLG,
    logoutUserLG,
    updateUserLG,
    getUserLG,
    getSingleUserLG,
    deleteUserLG
} = require('../controllers/userLGController')

const router = express.Router()

// Import the requireAuth middleware
const requireAuth = require('../middleware/requireAuth')

// login route
router.post('/login', loginUserLG)

// signup route
router.post('/signup', signupUserLG)

// logout route
router.post('/logout', requireAuth, logoutUserLG)

/** --- ADMIN --- */
router.get('/', getUserLG) // get all users
router.get('/:id', getSingleUserLG) // get a single user
router.patch('/:id', updateUserLG) // update user route
router.delete('/:id', deleteUserLG) // delete a user

module.exports = router