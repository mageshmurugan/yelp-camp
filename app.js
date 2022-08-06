if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// mongodb + srv://mageshmurugan:<password>@cluster0.yu1cetk.mongodb.net/?retryWrites=true&w=majority

// console.log(process.env.CLOUDINARY_CLOUD_NAME)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';

const app = express();
app.use(express.urlencoded({ extended: true }))
const MongoStore = require("connect-mongo");

const dbUrl = process.env.DB_URL //|| 'mongodb://localhost:27017/yelp-camp';

// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

// const store = MongoDBStore.create({
//     mongoUrl: dbUrl,
//     touchAfter: 24 * 60 * 60,
//     crypto: {
//         secret: 'thisshouldbeabettersecret'
//     }
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

// const sessionConfig = {
//     store,
//     name: 'session',
//     secret,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         // secure: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// }

app.use(session({
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 60 * 60,
        crypto: {
            secret: 'thisshouldbeabettersecret'
        }
    })
}));
app.use(flash());
// app.use(helmet({ contentSecurityPolicy: false }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // res.locals.returnTo = req.originalUrl;
    // console.log(`app.use....${req.session.returnTo}`)  
    // console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.primary = req.flash('primary');
    next();
})

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'coltttt@gmail.com', username: 'colttt' });
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);
// })

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went Wrong'

    if (err.message === 'Page Not Found') {
        req.flash('success', `PAGE NOT FOUND`)
        res.redirect('/campgrounds')
    } else if (err.name === 'CastError') {
        req.flash('primary', 'No Campground in this ID')
        res.redirect('/campgrounds')
    }
    else if (err.name === "Error") {
        req.flash('primary', err.message)
        res.redirect('/campgrounds')

    }
    else {
        res.status(statusCode).render('error', { err });
    }
    // res.send('Oh Boy,Something Went Wrong')
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`SERVING ON PORT${port}`)
})