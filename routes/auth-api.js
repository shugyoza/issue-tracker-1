'use strict'
const   express = require('express')
    ,   passport = require('passport')
    ,   LocalStrategy = require('passport-local')
    ,   crypto = require('crypto')
    ,   { csrfProtection, asyncHandler } = require('./utils')
    ,   { validationResult } = require('express-validator');

const   User = require('../db/models/user'),
        Funct = require('../controllers/functions.js')
    ,   myDB = require('../connection');

const {
    loginValidators,
    userValidators,
} = require('../controllers/validator.js');

const router = express.Router();
let funct = new Funct();


// GET form to register a new user
// router.get('/add', csrfProtection, funct.add_user)
router.get('/add', csrfProtection, (req, res) => {
    const user = {}; // new User({});
    res.status(200).render('user-add', {
        title: 'Create User', // 'Create User',
        user,
        csrfToken: req.csrfToken()
    })
})

myDB(async (client) => {
    const myDataBase = await client.db('database').collection('users')

    router.get('/signin', csrfProtection, (req, res) => {
        const user = {};
        res.render('user-login', {
            title: 'Sign-in',
            message: 'Please sign in',
            user,
            csrfToken: req.csrfToken()
        });
    });
    // serialization and deserialization
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
            done(null, null);
        });
    });
}).catch((err) => {
    router.get('/signin', (req, res) => {
        res.render('user-login', {
            title: err,
            message: 'Unable to Login',
            user,
            csrfToken: req.csrfToken()
        })
    })
})



// GET form to login user
router.get('/login', csrfProtection, loginValidators, (req, res, next) => {
    try {
        const user = {},
              validatorErrors = validationResult(req),
              email = '';
        if (!req.query.bool && !req.query.registered) {
            return res.status(200).render('user-login', {
                title: 'Login',
                user,
                csrfToken: req.csrfToken()
            })
        }
        // handle redirect from any attempt to access any page without login
        if (req.query.bool === 'false') {
            validatorErrors.errors = [{
                value: email,
                msg: `You must login to access that page.`,
                param: 'user',
                location: 'body'
            }];
        }
        // handle redirect from attempt to register an email already exists in database
        if (req.query.registered === 'true') {
            validatorErrors.errors = [{
                value: email,
                msg: 'Email already registered. Please login.',
                param: 'user',
                location: 'body'
            }];
        }
        const errors = validatorErrors.array().map((error) => error.msg);
        return res.status(400).render('user-login', {
            title: 'Login',
            user,
            errors,
            csrfToken: req.csrfToken()
        })
    } catch (err) {
        next(err);
    }
})

// POST form to register new user
router.post('/add', csrfProtection, userValidators, asyncHandler(async (req, res, next) => {
    try {
        console.log(req.body)
        const { first_name, last_name, email, password } = req.body;
        const user = new User({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password
        });
        const validatorErrors = validationResult(req);
        if (!funct.isValidName(first_name)) {
            validatorErrors.errors.push({
                value: first_name,
                msg: 'Only arabic alphabets are allowed for Name.',
                param: 'first_name',
                location: 'body'
            });
        }
        if (!funct.isValidName(last_name)) {
            validatorErrors.errors.push({
                value: last_name,
                msg: 'Only arabic alphabets are allowed for Name.',
                param: 'last_name',
                location: 'body'
            });
        }
        if (User.findOne({ email: email })._id) {
            validatorErrors.errors.push({
                value: email,
                msg: 'Email is already in database.',
                param: 'email',
                location: 'body'
            });
        }
        const errors = validatorErrors.array().map((error) => error.msg);
        if (!validatorErrors.isEmpty || errors.length) {
            return res.status(400).render('user-add', {
                title: 'Create User',
                user,
                errors,
                csrfToken: req.csrfToken()
            })
        }
        else {
            await user.save();
            return res.status(302).redirect(`/user/${user._id}`);
        }
    } catch (err) {
        // catching errors thrown because of duplicate index (email already exist)
        if (err.code === 11000) {
            return res.status(302).redirect('/user/login?registered=true')
        }
        next(err);
    }
}));

// POST form to login existing user
router.post('/login', csrfProtection, loginValidators, asyncHandler(async (req, res, next) => {
    try {
    const { email, password } = req.body;
    const validatorErrors = validationResult(req);
    if (validatorErrors.isEmpty()) {
        let user = await User.findOne({ email: email });
        if (!user) {
            validatorErrors.errors.push({
                value: email,
                msg: 'Invalid email address / password.',
                param: 'email',
                location: 'body'
            });
            const errors = validatorErrors.array().map((error) => error.msg);
            user = { email: email, password: password };
            return res.status(400).render('user-login', {
                title: 'Login', // 'User Login',
                user,
                errors,
                csrfToken: req.csrfToken()
            })
        } else if (user) {
            if (user.password !== password) {
                validatorErrors.errors.push({
                    value: password,
                    msg: 'Invalid email address / password.',
                    param: 'password',
                    location: 'body'
                });
                const errors = validatorErrors.array().map((error) => error.msg);
                user = { email: email, password: password };
                return res.status(400).render('user-login', {
                    title: 'Login', // 'User Login',
                    user,
                    errors,
                    csrfToken: req.csrfToken()
                })
            }
            else res.redirect(`/user/${user._id}`);
        }
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        let user = { email: email, password: password };
        return res.status(400).render('user-login', {
            title: 'Login', // 'User Login',
            user,
            errors,
            csrfToken: req.csrfToken()
        });
    }
    } catch (err) {
        next(err);
    }
}))

module.exports = router;
