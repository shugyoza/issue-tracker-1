'use strict'
const   express = require('express'),
        csrf = require('csurf'),
        { validationResult } = require('express-validator')

const   User = require('../db/models/user'),
        Issue = require('../db/models/issue'),
        Funct = require('../controllers/issue-handler.js');

const {
    loginValidators,
    userValidators,
    issueValidators } = require('../controllers/validator.js');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
let funct = new Funct();

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
    const user = {}; // new User({});
    res.render('user-add', {
        title: '', // 'Create User',
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
        if (!req.query.bool) {
            return res.render('user-login', {
                title: '',
                user,
                csrfToken: req.csrfToken()
            })
        }
        // handle redirect from any attempt to access any page without login
        if (req.query.bool === 'false') {
            validatorErrors.errors.push({
                value: email,
                msg: `You must login to access that page.`,
                param: 'user',
                location: 'body'
            })
        }
        const errors = validatorErrors.array().map((error) => error.msg);
        res.render('user-login', {
            title: '',
            user,
            errors,
            csrfToken: req.csrfToken()
        })
    } catch (err) {
        next(err);
    }
})

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
        if (!funct.isValidName(first_name) || !funct.isValidName(last_name)) {
            validatorErrors.errors.push({
                value: first_name,
                msg: 'Only arabic alphabets are allowed for Name.',
                param: 'first_name',
                location: 'body'
            });
            const errors = validatorErrors.array().map((error) => error.msg);
            return res.render('user-add', {
                title: '', // 'User Login',
                user,
                errors,
                csrfToken: req.csrfToken()
            })
        }
        else if (funct.isValidName(first_name) || funct.isValidName(last_name)) {
            let user = await User.findOne({ email: email });
            if (user) {
                validatorErrors.errors.push({
                    value: email,
                    msg: 'Email is already in database.',
                    param: 'email',
                    location: 'body'
                });
                const errors = validatorErrors.array().map((error) => error.msg);
                res.render('user-add', {
                    title: '', // 'User Login',
                    user,
                    errors,
                    csrfToken: req.csrfToken()
                });
                await user.save();
                return res.redirect(`/user/${user._id}`);
            }
        }
    }
    const errors = validatorErrors.array().map((error) => error.msg);
    res.render('user-add', {
        title: '', // 'Create User',
        user,
        errors,
        csrfToken: req.csrfToken()
    });
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
                msg: 'You have inputted wrong email/password.',
                param: 'email',
                location: 'body'
            });
            const errors = validatorErrors.array().map((error) => error.msg);
            user = { email: email, password: password };
            res.render('user-login', {
                title: '', // 'User Login',
                user,
                errors,
                csrfToken: req.csrfToken()
            })
        } else if (user) {
            if (user.password !== password) {
                validatorErrors.errors.push({
                    value: password,
                    msg: 'You have inputted wrong email/password.',
                    param: 'password',
                    location: 'body'
                });
                const errors = validatorErrors.array().map((error) => error.msg);
                user = { email: email, password: password };
                res.render('user-login', {
                    title: '', // 'User Login',
                    user,
                    errors,
                    csrfToken: req.csrfToken()
                })
            }
            else res.redirect(`./${user._id}`);
        }
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        let user = { email: email, password: password };
        res.render('user-login', {
            title: '', // 'User Login',
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
        if (!funct.isValidMongoId(req.params.userid)) {
            return res.redirect('/user/login?bool=false');
        }
        const user = await User.findById(req.params.userid);
        res.render('user-dashboard', {
            title: '',/*`Hello ${user.first_name}`,*/
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
            title: '', /*'User Edit',*/
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
                title: '', /*`Hello ${user.first_name}`,*/
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                user,
                csrfToken: req.csrfToken()
            });
            } else {
            const errors = validatorErrors.array().map((error) => error.msg);
            res.render('user-login', {
                title: '', // 'User Login',
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
router.get('/:userid/issue', async (req, res, next) => {
    try {
        if (!funct.isValidMongoId(req.params.userid)) {
            return res.redirect('/user/login?bool=false');
        }
        const issues = await Issue.find({ userid: req.params.userid });
        const user = { _id: req.params.userid };
        res.render('issue-list', { title: ''/*'Issues'*/, issues, user });
    } catch (err) {
        next(err);
    }
})

// GET form to add new issue from user dashboard
router.get('/:userid/issue/add', csrfProtection, userValidators, asyncHandler(async (req, res, next) => {
    try {
        let user;
        if (!funct.isValidMongoId(req.params.userid)) {
            return res.redirect('/user/login?bool=false');
        }
        user = await User.findById(req.params.userid);
        console.log(user._id)
        const issue = {};
        res.render('issue-add', {
            title: '',
            issue,
            user,
            csrfToken: req.csrfToken()
        })
    } catch (err) {
        next(err);
    }
}))

// POST form to add issue from user dashboard
router.post('/:userid/issue/add', csrfProtection, issueValidators, asyncHandler(async(req, res) => {
    const {
        project,
        issue_type,
        summary,
        description,
        priority,
        reporter,
        assignee,
        status
    } = req.body;

    const issue = new Issue({
        project: project,
        issue_type,
        summary: summary,
        description: description,
        priority: priority,
        reporter: reporter,
        assignee: assignee,
        status: status,
        log: [],
        userid: req.params.userid
    });

    const user = { _id: req.params.userid };
    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await issue.save();
        res.redirect(`/user/${user._id}/issue`);
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        res.render('issue-add', {
            title: '', // 'Add Issue',
            issue,
            user,
            errors,
            csrfToken: req.csrfToken()
        });
    }
}))

// GET form to find issue(s) with a set of criteria
router.get('/:userid/issue/find', csrfProtection, async (req, res, next) => {
    try {
        if (!funct.isValidMongoId(req.params.userid)) {
            return res.redirect('/user/login?bool=false');
        }
        const user = await User.findById(req.params.userid);
        const issue = { project: '' };
        res.render('issue-find', {
            title: '', // 'Find Issue',
            user,
            issue,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
});

// POST form to find issue(s) with a set of criteria
router.post('/:userid/issue/find', csrfProtection, issueValidators, asyncHandler(async (req, res, next) => {
    try {
        const { project, issue_type, summary, description, reporter, assignee, status } = req.body;
        for (let key in req.body) {
            if (req.body[key] === '') delete req.body[key];
        }
        const validatorErrors = validationResult(req);
        const issues = await Issue.find(req.body).exec();
        const user = { _id: req.params.userid };
        if (validatorErrors.isEmpty()) {
            res.render('issue-list', { title: '' /*'Issues'*/, issues, user });
        } else {
            const errors = validatorErrors.array().map((error) => error.msg);
            res.render('issue-list', {
                title: '', // 'Issues',
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

// GET form to update issue
router.get('/:userid/issue/:issueId/update', csrfProtection, issueValidators, async (req, res, next) => {
    try {
        const issue = await Issue.findById({ _id: req.params.issueId });
        const user = { _id: req.params.userid };
        res.render('issue-update', {
            title: '',
            issue,
            user,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
})

// POST form to update issue.
router.post('/:userid/issue/:issueId/update', csrfProtection, issueValidators, asyncHandler(async (req, res, next) => {
    try {
        const { project, issue_type, summary, description, reporter, assignee, status } = req.body;
        const validatorErrors = validationResult(req);
        const user = { _id: req.params.userid };
        const issueId = req.params.issueId;
        const issue = await Issue.findById(issueId);

        if (project) issue.project = project;
        if (issue_type) issue.issue_type = issue_type
        if (summary) issue.summary = summary;
        if (description) issue.description = description;
        if (reporter) issue.reporter = reporter;
        if (assignee) issue.assignee = assignee;
        if (status) issue.status = status;

        if (validatorErrors.isEmpty()) {
            await issue.save();
            const issues = await Issue.find({ _id: issueId});
            res.render('issue-list', {
                title: 'Issues',
                user,
                issues,
                csrfToken: req.csrfToken()
            });
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

// GET form to delete issue
router.get('/:userid/issue/:issueId/delete', csrfProtection, issueValidators, async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        const user = { _id: req.params.userid };
        res.render('issue-delete', {
            title: '',
            issue,
            user,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
})

// POST form to delete issue
router.post('/:userid/issue/:issueId/delete', csrfProtection, asyncHandler(async (req, res, next) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.issueId);
        const user = { _id: req.params.userid };
        const issues = await Issue.find({});
        res.redirect('/:userid/issue');
    } catch (err) {
        next(err)
    }
}))

module.exports = router;
