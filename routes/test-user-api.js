'use strict'
const express = require('express')
    , { validationResult } = require('express-validator');

const User = require('../db/models/user')
    , {
        asyncHandler,
        isValidId,
        isValidName
    } = require('../controllers/utils');

const {
    loginValidators,
    userValidators,
} = require('../controllers/validator.js');

const router = express.Router();

// GET list of all users
// for test purpose
router.get('/user/super', async (req, res, next) => {
    try {
        const users = await User.find({});
        res.status(200).type('application/json').json(users);
    } catch (err) {
        next(err);
    }
})

// POST form to register new user
router.post('/user/add', userValidators, asyncHandler(async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const user = new User({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password
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
            return res.status(400).type('json').json(user);
        }
        else {
            await user.save();
            return res.status(200).type('json').json({
                status: 302,
                redirect: `test/user/${user._id}`
            });
        }
    } catch (err) {
        // catching errors thrown because of duplicate index (email already exist)
        if (err.code === 11000) {
            return res.status(400).type('json').json({
                error: err,
                status: 302,
                redirect: '/test/user/login?registered=true'
            });
        }
        next(err);
    }
}));


// POST form to login existing user
router.post('/user/login', loginValidators, asyncHandler(async (req, res, next) => {
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
            user = { email: email, password: password, error: errors };
            return res.status(400).type('json').json(user);
        } else if (user) {
            if (user.password !== password) {
                validatorErrors.errors.push({
                    value: password,
                    msg: 'Invalid email address / password.',
                    param: 'password',
                    location: 'body'
                });
                const errors = validatorErrors.array().map((error) => error.msg);
                user = { email: email, password: password, error: errors };
                return res.status(400).type('json').json(user);
                }
            else return res.status(200).type('application/json').json({
                email: email,
                password: password,
                code: 302,
                redirect: `/test/user/${user._id}`
            });
        }
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        let user = { email: email, password: password, error: errors };
        return res.status(400).type('json').json(user);
    }
    } catch (err) {
        next(err);
    }
}))


// PUT form to edit user. DO NOT put this AFTER '/:userid/:issue' !
router.post('/user/:userid/edit', userValidators, asyncHandler(async (req, res, next) => {
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
            return res.status(400).json(user)
        }
        else {
            if (first_name) user.first_name = first_name;
            if (last_name) user.last_name = last_name;
            if (email) user.email = email;
            if (password) user.password = password;
            await user.save();
            return res.status(200).json({
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                code: 302,
                redirect: `/user/${user._id}`
            });
        }
    } catch (err) {
        next(err);
    }
}));

// DELETE form to delete user. DO NOT put this AFTER '/:userid/:issue' !
router.post('/user/:userid/delete', asyncHandler(async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.userid);
        return res.status(200).type('json').json({
            _id: req.params.userid,
            code: 302,
            redirect: '/test/user/login'
        });
    } catch (err) {
        next(err);
    }
}))

// DELETE form to delete user. DO NOT put this AFTER '/:userid/:issue' !
router.post('/user/delete/:userid', asyncHandler(async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.userid);
        return res.status(200).type('json').json({
            _id: req.params.userid,
            code: 302,
            redirect: '/test/user/login'
        });
    } catch (err) {
        next(err);
    }
}))

module.exports = router;
