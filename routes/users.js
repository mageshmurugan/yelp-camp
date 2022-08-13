const express = require('express');
const router = express.Router();
const passport = require('passport');
// const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')


router.route('/preRegister')
    .get(users.renderRegister)
    .post(users.preRegister)
router.route('/register')
    .get(users.renderPreRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login);

router.get('/logout', users.logout);

module.exports = router;