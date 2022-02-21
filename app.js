const   express = require('express')
    ,   morgan = require('morgan')
    ,   cookieParser = require('cookie-parser')
    ,   bodyParser = require('body-parser')
    ,   cors = require('cors')
    ,   session = require('express-session')   //
    ,   passport = require('passport');

// const { port } = require('./config')
//    , { sessionSecret } = require('./config')   //

require('dotenv').config();
const   userRoutes = require('./routes/user-api.js')
    ,   issueRoutes = require('./routes/issue-api.js');
//    ,   Auth = require('./controllers/auth.js'); //


const app = express();
//    , auth = new Auth();


app.set('view engine', 'pug');


app.use(cors({ origin: '* '}));


app.use(morgan('dev'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* app.use(session({   //
    name: 'whatever',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
}))
app.use(auth.restoreUser) // */

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', userRoutes);
app.use('/user', issueRoutes);

app.get('/', (req, res) => {
    res.redirect('/user/login')
//    res.render('index', { title: 'Home' })
})

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

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`))

module.exports = app // needed to be used in the functional test
