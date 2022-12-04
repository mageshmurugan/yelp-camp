const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync')
// const ExpressError = require('../utils/ExpressError')
// const Campground = require('../models/campground');
// const session = require('express-session');
// const flash = require('connect-flash');
// const { campgroundSchema } = require('../schemas.js')
const { isLoggedIn, validateCampground, validateFiles, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });

// , upload.array('image')

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), campgrounds.createCampground);
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send('IT WORKED')
// })

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), campgrounds.updateCampground)
    // .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, campgrounds.updateCampground)
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;