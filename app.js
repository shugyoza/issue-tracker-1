const express = require('express')
    , MongoStore = require('connect-mongo')
    , morgan = require('morgan')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , cors = require('cors');

const passport = require('passport')
    , flash = require('express-flash')
    , session = require('express-session')
    , methodOverride = require('method-override');
const User = require('./db/models/user');

const userRoutes = require('./routes/user-api')
    , issueRoutes = require('./routes/issue-api')
    , testUserRoutes = require('./routes/test-user-api')
    , { logSession,
        getUserByEmail,
        getUserById,
        checkAuthenticated } = require('./controllers/utils')
    , initializePassport = require('./config/passport-config');

/* - - - - - - - - - - - - - - - - GENERAL SETUP - - - - - - - - - - - - - - - - - - -  */

// WHERE?
// initializePassport(
//     passport,
//     email => User.find(user => user.email === email),
//     _id => User.find(user => user._id === _id)
// )
initializePassport( passport, getUserByEmail, getUserById );


// gives us access to variables set in .env file via process.env.VARIABLE_NAME
require('dotenv').config();
const app = express();

app.set('view engine', 'pug');
app.use(cors({ origin: '* '}));

app.use(morgan('dev'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());     // we can use built-in: app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true })); // we can use: app.use(express.urlencoded({ extended: true}))
app.use(cookieParser());
app.use(flash());
app.use(methodOverride('_method'));

/* - - - - - - - - - - - - - - - - SESSION SETUP - - - - - - - - - - - - - - - - - - -  */
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    key: 'express.sid',
    cookie: { // secure: false }
      maxAge: 1000 * 60 * 60 * 24 // == one day == 24 hours
  }
}));

/* - - - - - - - - - - - - - PASSPORT AUTHENTICATION - - - - - - - - - - - - - - - - -  */
app.use(passport.initialize()); // integrate with, thus must be after app.use(session..)
app.use(passport.session());    // integrate with, thus must be after app.use(session..)
app.use(logSession);

/* - - - - - - - - - - - - - - - - R O U T E S - - - - - - - - - - - - - - - - - - -  */
app.use('/test', testUserRoutes);
app.use('/user', userRoutes);
app.use('/user', issueRoutes);

app.get('/', (req, res) => res.status(302).redirect('/user/login'))

/* - - - - - - - - - - - - - - - - ERROR HANDLING - - - - - - - - - - - - - - - - - - -  */
app.get('/throw-error', (req, res) => {
    throw new Error('An error occurred!');
})

// catch unhandled requests and forward to error handler.
app.use((req, res, next) => {
    const err = new Error('The requested page could not be found.');
    err.status = 404;
    next(err);
});

// Custom error handlers.

// Error handler to log errors
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        // TODO Log the error to the database
    } else {
        console.error(err);
    }
    next(err);
});
// Error handler for 404 errors
app.use((err, req, res, next) => {
    if (err.status === 404) {
        res.status(404);
        res.render('error-page-not-found', {
            title: '404: Page Not Found',
        });
    } else {
        next(err);
    }
});
// Generic error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    const isProduction = process.env.NODE_ENV === 'production';
    res.render('error', {
        title: 'Server Error',
        message: isProduction ? null : err.message,
        stack: isProduction ? null : err.stack
    });
});

/* - - - - - - - - - - - - - - - - S E R V E R - - - - - - - - - - - - - - - - - - -  */
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`))

module.exports = app // needed to be used in the functional test
