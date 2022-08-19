const passport = require('passport');
const User = require('../models/user');
const Otp = require('../models/otpmodel');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const axios = require("axios");
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');



const authmail = nodemailer.createTransport({
    service: 'gmail',
    // host: 'smtp.ethereal.email',
    // port: 587,
    auth: {
        user: 'mageshmurugan64@gmail.com',
        pass: 'nwhlltxkjhonekoh'
    }
});

module.exports.renderPreRegister = (req, res) => {
    res.render('users/preRegister')
    // console.log(req.session.returnTo)
}
module.exports.renderRegister = async (req, res) => {
    const renderEmail = await Otp.findOne({
        _id: req.session.campgro
    });
    res.render('users/register', { renderEmail })
    // console.log(req.session.returnTo)
}
module.exports.preRegister = async (req, res, next) => {
    const { email, username } = req.body;
    const mail = await User.findOne({
        email: email
    });
    const names = await User.findOne({
        username: username
    });
    if (mail) {
        req.flash('error', `The Email is already registered`);
        res.redirect('/register')
    } else if (names) {
        req.flash('error', `The Username is already registered`);
        res.redirect('/register')
    }
    else {
        const OTP = otpGenerator.generate(6, {
            digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });
        const hash = await bcrypt.hash(OTP, 12);
        const mai = await Otp.findOne({
            email: email
        });
        const nam = await Otp.findOne({
            username: username
        });
        if (mai) {
            mai.otp = await hash;
            await mai.save()
            const camp = mai._id;
            req.session.campgro = camp;

        } else if (nam) {
            nam.otp = await hash;
            await nam.save()
            const camp = nam._id;
            req.session.campgro = camp;

        } else if (mai && nam) {
            nam.otp = await hash;
            await nam.save()
            const camp = nam._id;
            req.session.campgro = camp;

        } else {
            const user = new Otp({ email: email, username: username, otp: hash });
            await user.save();
            const camp = user._id;
            req.session.campgro = camp;
        }


        const mailOptions = {
            from: 'Yelp Camp <mageshmurugan64@gmail.com>',
            to: `${email}`,
            subject: `YelpCamp`,
            text: `Here is Your Otp\n${OTP}`
            // html: `<h3>YelpCamp</h3>\n<p> {{OTP}}</P>`

        };


        try {
            authmail.sendMail(mailOptions,
                function (error, info) {
                    if (error) {
                        console.log('ERROR')
                        console.log(error);
                    } else {
                        console.log('Email Sent :' + info.response);
                    }
                });
        } catch {
            req.flash('error', `Enter Valid Email ID`);
            return res.redirect('/register');
        }

        console.log(OTP)
        req.flash('primary', `Otp Sent to Email Succesfully`);
        res.redirect('/preRegister')
    }
}
module.exports.register = async (req, res, next) => {
    try {
        const { password, otp } = req.body;

        const otpVerify = await Otp.findOne({
            _id: req.session.campgro
        });
        const validUser = await bcrypt.compare(otp, otpVerify.otp);
        if (validUser && otpVerify) {
            const user = await new User({
                email: otpVerify.email,
                username: otpVerify.username
            });
            const registeredUser = await User.register(user, password);
            const deleteOtp = await Otp.deleteOne({
                _id: req.session.campgro
            });
            console.log(deleteOtp)
            const redirectUrl = req.session.returnTo || '/campgrounds';
            delete req.session.returnTo;
            delete req.session.campgro;

            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash('success', `Welcome to Yelp Camp ${user.username}`);
                res.redirect(`${redirectUrl}`);
            });
        } else {
            req.flash('error', `Wrong Otp`);
            res.redirect('/preRegister');
        }

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}


// module.exports.register = async (req, res, next) => {
//     try {
//         const { email, username, password } = req.body;
//         const user = new User({ email, username });
//         const registeredUser = await User.register(user, password);
//         // console.log(`register${req.session.returnTo}`)
//         // console.log(registeredUser)
//         const redirectUrl = req.session.returnTo || '/campgrounds';
//         delete req.session.returnTo;
//         req.login(registeredUser, err => {
//             if (err) return next(err);
//             req.flash('success', `Welcome to Yelp Camp ${username}`);
//             res.redirect(`${redirectUrl}`);
//         });
//     } catch (e) {
//         req.flash('error', e.message);
//         res.redirect('register');
//     }
// }

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    const { username } = req.body;
    req.flash('success', `welcome back ${username}`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    // console.log(`login ${redirectUrl}`)
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Successfully Logged you Out');
        res.redirect('/campgrounds')
    });

}