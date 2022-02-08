'use strict'
const express = require('express');
const csrf = require('csurf');
const { check, validationResult } = require('express-validator');

const User = require('../db/models/user');
const Issue = require('../db/models/issue');
const IssueHandler = require('../controllers/issue-handler.js');
const user = require('../db/models/user');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
let issueHandler = new IssueHandler();

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

// GET list of all users
router.get('/', async (req, res, next) => {
    try {
        const users = await User.find({});
        res.render('user-list', { title: 'Users', users });
    } catch (err) {
        next(err);
    }
})

// GET form to register a new user
router.get('/add', csrfProtection, (req, res) => {
    const user = new User({});
    res.render('user-add', {
        title: 'Create User',
        user,
        csrfToken: req.csrfToken()
    })
})

// GET form to login user
router.get('/login', csrfProtection, (req, res) => {
    const user = new User({});
    res.render(`user-login`, {
        title: 'User Login',
        user,
        csrfToken: req.csrfToken()
    })
})

// validator for registering new user
const userValidators = [
    check('first_name')
    .exists({ checkFalsy: true })
    .withMessage('Please input your First Name.')
    .isLength({ max: 100 })
    .withMessage('First Name must be less than 100 characters long.'),
    check('last_name')
    .exists({ checkFalsy: true })
    .withMessage('Please input your Last Name.')
    .isLength({ max: 100 })
    .withMessage('Last Name must be less than 100 characters long.'),
    check('email')
    .exists({ checkFalsy: true })
    .withMessage('Please input your Email')
    .isLength({ max: 255 })
    .withMessage('Email should not be that long.'),
    check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please input your desired Password.')
    .isLength({ max: 100 })
    .withMessage('Password should not be that long.')
];

// validator for login existing user
const loginValidators = [
    check('email')
    .exists({ checkFalsy: true })
    .withMessage('Please input email registered in this database to login.')
    .isLength({ max: 255 })
    .withMessage('You input wrong email address.'),
    check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please input password to login.')
    .isLength({ max: 100 })
    .withMessage('You input wrong password.')
];

// POST form to register new user
router.post('/add', csrfProtection, userValidators, asyncHandler(async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password
    } = req.body;

    const user = new User({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password
    });

    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await user.save();
        res.redirect('/');
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        res.render('user-add', {
            title: 'Add User',
            user,
            errors,
            csrfToken: req.csrfToken()
        });
    }
}))

// POST form to login existing user
router.post('/login', csrfProtection, loginValidators, asyncHandler(async (req, res) => {
    try {
    const { email, password } = req.body;
    const validatorErrors = validationResult(req);
    const user = await User.findOne({ email: email, password: password });
    if (validatorErrors.isEmpty()) {
        res.redirect(`./${user._id}`)
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        res.render('user-login', {
            title: 'User Login',
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
        const user = await User.findById(req.params.userid);
        res.render('user-dashboard', {
            title: `Hello ${user.first_name}`,
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
router.get('/:userid/edit', csrfProtection, userValidators, asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.userid);
        res.render('user-edit', {
            title: 'User Edit',
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
        const validatorErrors = validationResult(req);
        const user = await User.findById(req.params.userid);
        user.first_name = first_name;
        user.last_name = last_name;
        user.email = email;
        user.password = password;
        if (validatorErrors.isEmpty()) {
            await user.save();
            res.render('user-dashboard', {
                title: `Hello ${user.first_name}`,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                user,
                csrfToken: req.csrfToken()
            });
            } else {
            const errors = validatorErrors.array().map((error) => error.msg);
            res.render('user-login', {
                title: 'User Login',
                user,
                errors,
                csrfToken: req.csrfToken()
            });
        }
    } catch (err) {
        next(err);
    }
}))

// GET list of all issues made under this user
router.get('/:userid/:issue', async (req, res, next) => {
    try {
        const issues = await Issue.find({ userid: req.params.userid });
        const user = { _id: req.params.userid };
        res.render('issue-list', { title: 'Issues', issues, user });
    } catch (err) {
        next(err);
    }
})

// GET form to add new issue from user dashboard
router.get('/:userid/issue/add', csrfProtection, (req, res, next) => {
    const issue = new Issue({});
    const user = { _id: req.params.userid };
    res.render('issue-add', {
        title: 'Add Issue',
        issue,
        user,
        csrfToken: req.csrfToken()
    })
})

// validator for new issue input
const issueValidators = [
    check('title')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Title.')
    .isLength({ max: 255 })
    .withMessage('Title must not be more than 255 characters long.'),
    check('remark')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Remark.')
    .isLength({ max: 500 })
    .withMessage('Remark must not be more than 500 characters long.'),
    check('creator')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Creator.')
    .isLength({ max: 255 })
]

// POST form to add issue from user dashboard
router.post('/:userid/issue/add', csrfProtection, issueValidators, asyncHandler(async(req, res) => {
    const {
        project,
        title,
        remark,
        creator,
        assignee,
        status
    } = req.body;

    const issue = new Issue({
        project: project,
        title: title,
        remark: remark,
        creator: creator,
        assignee: assignee,
        status: status,
        log: [],
        userid: req.params.userid
    });

    const user = { _id: req.params.userid };
    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await issue.save();
        res.redirect(`/user/${user._id}`);
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        res.render('issue-add', {
            title: 'Add Issue',
            issue,
            user,
            errors,
            csrfToken: req.csrfToken()
        });
    }
}))

// GET form to find issue(s) with a set of criteria
router.get('/:userid/issue/find', csrfProtection, (req, res) => {
    const user = { _id: req.params.userid };
    const issue = { project: '' };
    res.render('issue-find', {
        title: 'Find Issue',
        user,
        issue,
        csrfToken: req.csrfToken()
    });
})

// POST form to find issue(s) with a set of criteria
router.post('/:userid/issue/find', csrfProtection, issueValidators, asyncHandler(async (req, res, next) => {
    try {
        const { project, title, remark, creator, assignee, status } = req.body;
        for (let key in req.body) {
            if (req.body[key] === '') delete req.body[key];
        }
        const validatorErrors = validationResult(req);
        const issues = await Issue.find(req.body).exec();
        console.log(issues, req.body)
        if (validatorErrors.isEmpty()) {
            res.render('issue-list', { title: 'Issues', issues, user });
        } else {
            const errors = validatorErrors.array().map((error) => error.msg);
            res.render('issue-list', {
                title: 'User Login',
                user,
                issues,
                errors,
                csrfToken: req.csrfToken()
            });
        }
        } catch (err) {
            next(err);
        }
    }))

// GET form to edit issue
router.get('/:userid/issue/:issueId/update', csrfProtection, issueValidators, async (req, res, next) => {
    try {
        const issue = await Issue.findById({ _id: req.params.issueId });
        const user = { _id: req.params.userid };
        res.render('issue-update', {
            title: 'Issue',
            issue,
            user,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
})

// POST form to edit issue.
router.post('/:userid/issue/:issueId/update', csrfProtection, issueValidators, asyncHandler(async (req, res, next) => {
    try {
        const { title, remark, creator, assignee, status } = req.body;
        const validatorErrors = validationResult(req);
        const user = { _id: req.params.userid };
        const issue = await Issue.findById(req.params.issueId);

        if (title) issue.title = title;
        if (remark) issue.remark = remark;
        if (creator) issue.creator = creator;
        if (assignee) issue.assignee = assignee;
        if (status) issue.status = status;

        if (validatorErrors.isEmpty()) {
            await issue.save();
            res.redirect(`/${user._id}/issue`);
            } else {
            const errors = validatorErrors.array().map((error) => error.msg);
            res.render('issue-update', {
                title: 'Issue Update',
                issue,
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
