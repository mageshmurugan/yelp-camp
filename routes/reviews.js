const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews')
// const Campground = require('../models/campground');
// const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')
// const ExpressError = require('../utils/ExpressError')
// const session = require('express-session');
// const flash = require('connect-flash');
// const { reviewSchema } = require('../schemas.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;