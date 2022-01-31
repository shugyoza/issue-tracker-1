const express = require('express')
require('dotenv').config();
// const { port } = require('./config');
const app = express();

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index', { title: 'Home' })
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

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`))

// 1 // app.get('/', (req, res) => res.send('Hello from Express!'));
/* 2  app.all('*', (req, res) => {
    console.log(`Request method: ${req.method}`);
    console.log(`Request path: ${req.path}`);
    res.render('layout', { title: 'Welcome', heading: 'Home' })
}) */
