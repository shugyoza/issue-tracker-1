'use strict'
const express = require('express')
    , { validationResult } = require('express-validator');

const User = require('../db/models/user')
    , {
        asyncHandler,
        csrfProtection,
        isValidId,
        isValidName
    } = require('../controllers/utils');

const {
    loginValidators,
    userValidators,
} = require('../controllers/validator.js');


const passport = require('passport')
    , bcrypt = require('bcrypt')
    , flash = require('express-flash')
    , session = require('express-session')
    , { getUserByEmail,
        getUserById,
        checkAuthenticated,
        checkNotAuthenticated } = require('../controllers/utils')
    , initializePassport = require('../config/passport-config');

/* - - - - - - - - - - - - - - - - GENERAL SETUP - - - - - - - - - - - - - - - - - - -  */

// WHERE?
// initializePassport(
//     passport,
//     email => User.find(user => user.email === email),
//     _id => User.find(user => user._id === _id)
// )
initializePassport( passport, getUserByEmail, getUserById );



const router = express.Router();

// GET list of all users
router.get('/super', async (req, res, next) => {
    try {
        const users = await User.find({});
        return res.status(200).render('user-list', { title: 'Users', users });
    } catch (err) {
        next(err);
    }
})

// GET form to register a new user
router.get('/add', checkNotAuthenticated, csrfProtection, (req, res) => {
    const user = {}; // new User({});
    return res.status(200).render('user-add', {
        title: 'Create User', // 'Create User',
        user,
        csrfToken: req.csrfToken()
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
router.post('/add', checkNotAuthenticated, csrfProtection, userValidators, asyncHandler(async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hashedPassword
        });
        const validatorErrors = validationResult(req);
        if (!isValidName(first_name)) {
            validatorErrors.errors.push({
                value: first_name,
                msg: 'Only arabic alphabets are allowed for Name.',
                param: 'first_name',
                location: 'body'
            });
        }
        if (!isValidName(last_name)) {
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
            return res.status(302).redirect('/user/profile'); //`/user/${user._id}`);
        }
    } catch (err) {
        // catching errors thrown because of duplicate index (email already exist)
        if (err.code === 11000) {
            return res.status(302).redirect('/user/login?registered=true')
        }
        next(err);
    }
}));

/*
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
            else res.status(302).redirect(`/user/${user._id}`);
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
*/

router.post('/login', checkNotAuthenticated, csrfProtection, loginValidators, passport.authenticate('local', {
    // successRedirect: `/user/${req.session.passport.user}`, // I cannot have this since the app already built with /:userid for redirect.
    failureRedirect: '/user/login',
    failureFlash: true
}), asyncHandler(async(req, res) => {
    console.log(228, req.session.flash.error)
    const user = await User.find({ email: req.body.email });
    res.status(302).redirect(`/user/${user._id}`)
}))

// GET a user dashboard
router.get('/:userid', checkAuthenticated, csrfProtection, asyncHandler(async (req, res, next) => {
    try {
        if (!isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        const user = await User.findById(req.params.userid);
        res.status(200).render('user-dashboard', {
            title: `${user.first_name} ${user.last_name}'s Profile`,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            user,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
}))

// GET form to edit user. DO NOT put this AFTER '/:userid/:issue' !
router.get('/:userid/edit', csrfProtection, userValidators, asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userid);
        return res.status(200).render('user-edit', {
            title: 'Edit User',
            user,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
}))

// PUT form to edit user. DO NOT put this AFTER '/:userid/:issue' !
router.post('/:userid/edit', csrfProtection, userValidators, asyncHandler(async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const user = await User.findById(req.params.userid);
        const validatorErrors = validationResult(req);
        if (!isValidName(first_name)) {
            validatorErrors.errors.push({
                value: first_name,
                msg: 'Only arabic alphabets are allowed for Name.',
                param: 'first_name',
                location: 'body'
            });
        }
        if (!isValidName(last_name)) {
            validatorErrors.errors.push({
                value: last_name,
                msg: 'Only arabic alphabets are allowed for Name.',
                param: 'last_name',
                location: 'body'
            });
        }
        if (User.findOne({ email: email })._id && User.findOne({ email: email })._id !== user._id) {
            validatorErrors.errors.push({
                value: email,
                msg: 'Email is already in database.',
                param: 'email',
                location: 'body'
            });
        }
        const errors = validatorErrors.array().map((error) => error.msg);
        if (!validatorErrors.isEmpty || errors.length) {
            return res.status(400).render('user-edit', {
                title: 'Edit User',
                user,
                errors,
                csrfToken: req.csrfToken()
            })
        }
        else {
            if (first_name) user.first_name = first_name;
            if (last_name) user.last_name = last_name;
            if (email) user.email = email;
            if (password) user.password = password;
            await user.save();
            return res.status(302).redirect(`/user/${user._id}`);
        }
    } catch (err) {
        next(err);
    }
}));


// GET form to delete user. DO NOT put this AFTER '/:userid/:issue' !
router.get('/:userid/delete', csrfProtection, asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userid);
        return res.status(200).render('user-delete', {
            title: 'Delete User',
            user,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
}))

// DELETE form to delete user. DO NOT put this AFTER '/:userid/:issue' !
router.post('/:userid/delete', csrfProtection, asyncHandler(async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.userid);
        return res.status(302).redirect('/user/login');
    } catch (err) {
        next(err);
    }
}))

// GET form to delete user. DO NOT put this AFTER '/:userid/:issue' !
router.get('/delete/:userid', csrfProtection, asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userid);
        return res.status(200).render('user-delete', {
            title: 'Delete User', /*'User Edit',*/
            user,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
}))


// DELETE form to delete user. DO NOT put this AFTER '/:userid/:issue' !
router.post('/delete/:userid', csrfProtection, asyncHandler(async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.userid);
        return res.status(302).redirect('/user/login');
    } catch (err) {
        next(err);
    }
}))

// LOGOUT
router.post('/logout', (req, res, next) => {
    req.logOut(); // or req.logout()
    res.redirect('/user/login');

    // await req.logout();
    // await req.session.destroy(function(err) {
    //     res.clearCookie('connect.sid');
    //     // res.redirect('/')
    //     res.render('user-login', {
    //         title: 'Login',
    //         user: {},
    //         csrfToken: req.csrfToken()
    //     })

    // })

    // await req.logOut();
    // req.session.destroy(function(err) {
    //     req.session = null;
    //     req.sessionOptions.maxAge = -1;
    //     res.clearCookie('express.sid');
    //     res.redirect('/login')
    // })

    // req.logOut();
    // req.session.destroy((err) => {
    //     if (err) return next(err);
    //     req.session = null;
    //     req.user = null;
    //     res.clearCookie('express.sid');
    //     res.redirect('/user/login')
    // })

    // req.logOut();
    // req.session.destroy((err) => {
    //     if (err) return next(err);
    //     req.session.cookie = "cookiename= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    //     req.user = null;
    //     delete req.session.passport;
    //     req.session.
    //     res.clearCookie('express.sid', {path: '/'});
    //     res.redirect('/')
    // })

})

module.exports = router;
