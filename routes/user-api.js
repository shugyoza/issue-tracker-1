'use strict'
const   express = require('express'),
        csrf = require('csurf'),
        { validationResult } = require('express-validator');

const   User = require('../db/models/user'),
//        Issue = require('../db/models/issue'),
        Funct = require('../controllers/functions.js');

const {
    loginValidators,
    userValidators,
} = require('../controllers/validator.js');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
let funct = new Funct();

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

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
router.get('/add', csrfProtection, (req, res) => {
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
router.post('/add', csrfProtection, userValidators, asyncHandler(async (req, res, next) => {
    try {
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

// GET a user dashboard
router.get('/:userid', csrfProtection, asyncHandler(async (req, res) => {
    try {
        if (!funct.isValidId(req.params.userid)) {
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
            title: '', /*'User Edit',*/
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

module.exports = router;
