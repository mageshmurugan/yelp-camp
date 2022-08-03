const passport = require('passport');
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
    console.log(req.session.returnTo)
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // console.log(`register${req.session.returnTo}`)
        // console.log(registeredUser)
        const redirectUrl = req.session.returnTo || '/campgrounds';
        delete req.session.returnTo;
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to Yelp Camp ${username}`);
            res.redirect(`${redirectUrl}`);
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

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