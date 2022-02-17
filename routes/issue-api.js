'use strict'
const   express = require('express'),
        csrf = require('csurf'),
        { validationResult } = require('express-validator')

const   User = require('../db/models/user'),
        Issue = require('../db/models/issue'),
        Funct = require('../controllers/functions.js');

const {
    userValidators,
    createIssueValidators,
    findIssueValidators,
    updateIssueValidators
} = require('../controllers/validator.js');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
let funct = new Funct();

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

// GET list of all issues made under this user
router.get('/:userid/issue', async (req, res, next) => {
    try {
        if (!funct.isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        const issues = await Issue.find({ userid: req.params.userid });
        const user = { _id: req.params.userid };
        return res.status(200).render('issue-list', { title: 'List of Issues', issues, user });
    } catch (err) {
        next(err);
    }
})

// GET form to add new issue from user dashboard
router.get('/:userid/issue/add', csrfProtection, userValidators, asyncHandler(async (req, res, next) => {
    try {
        let user;
        if (!funct.isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        user = await User.findById(req.params.userid);
        const issue = {};
        return res.status(200).res.render('issue-add', {
            title: 'Add Issue',
            issue,
            user,
            csrfToken: req.csrfToken()
        })
    } catch (err) {
        next(err);
    }
}))

// POST form to add issue from user dashboard
router.post('/:userid/issue/add', csrfProtection, createIssueValidators, asyncHandler(async(req, res) => {
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
        return res.status(302).redirect(`/user/${user._id}/issue`);
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        return res.status(400).render('issue-add', {
            title: 'Add Issue',
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
        if (!funct.isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        const user = await User.findById(req.params.userid);
        const issue = { project: '' };
        return res.status(200).render('issue-find', {
            title: 'Find Issue',
            user,
            issue,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
});

// POST form to find issue(s) with a set of criteria
router.post('/:userid/issue/find', csrfProtection, findIssueValidators, asyncHandler(async (req, res, next) => {
    try {
        const { project, issue_type, summary, description, reporter, assignee, status } = req.body;
        let query = funct.getInput(req.body);
        if (!query.length) {
            return res.status(302).redirect(`/user/${req.params.userid}/issue`);
        }

        const validatorErrors = validationResult(req);
        const issues = await Issue.find(req.body).exec();
        const user = { _id: req.params.userid };
        if (validatorErrors.isEmpty()) {
            res.status(302)._idredirect(`/user/${req.params.userid}/issue/find?${'key=value'}`)
        } else {
            const errors = validatorErrors.array().map((error) => error.msg);
            return res.status(400).render('issue-list', {
                title: 'Find Issue',
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
router.get('/:userid/issue/:issueId/update', csrfProtection, async (req, res, next) => {
    try {
        const issue = await Issue.findById({ _id: req.params.issueId });
        const user = { _id: req.params.userid };
        return res.status(200).render('issue-update', {
            title: 'Update Issue',
            issue,
            user,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
})

// POST form to update issue.
router.post('/:userid/issue/:issueId/update', csrfProtection, updateIssueValidators, asyncHandler(async (req, res, next) => {

    try {
        const user = { _id: req.params.userid },
              issueId = req.params.issueId,
              update = funct.getInput(req.body);

        const validatorErrors = validationResult(req);

        let issue = await Issue.findById(issueId);
        if (project) {
            update.project = project;
        } else update.project = issue.project;
        if (issue_type) {
            update.issue_type = issue_type;
        } else update.issue_type = issue.issue_type;
        if (summary) {
            update.summary = summary;
        } else update.summary = issue.summary;
        if (description) {
            update.description = description;
        } else update.description = issue.description;
        if (priority) {
            update.priority = priority;
        } else update.priority = issue.priority;
        if (reporter) {
            update.reporter = reporter;
        } else update.reporter = issue.reporter;
        if (assignee) {
            update.assignee = assignee;
        } else update.assignee = issue.assignee;
        if (status) {
            update.status = status;
        } else update.status = issue.status;

        req.body = update;

        if (validatorErrors.isEmpty()) {
            await issue.findOneAndUpdate({ _id: issueId}, update, { new: true });
            const issues = await Issue.find({ _id: issueId});
            return res.render('issue-list', {
                title: 'Issues',
                user,
                issues,
                csrfToken: req.csrfToken()
            });
            } else {
            const errors = validatorErrors.array().map((error) => error.msg);
            return res.render('issue-update', {
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


//     try {
//         const { project, issue_type, summary, description, reporter, assignee, status } = req.body;
//         console.log(project)
//         const validatorErrors = validationResult(req);
//         const user = { _id: req.params.userid };
//         const issueId = req.params.issueId;
//         const issue = await Issue.findById(issueId);

//         if (project) issue.project = project;
//         if (issue_type) issue.issue_type = issue_type
//         if (summary) issue.summary = summary;
//         if (description) issue.description = description;
//         if (reporter) issue.reporter = reporter;
//         if (assignee) issue.assignee = assignee;
//         if (status) issue.status = status;

//         if (validatorErrors.isEmpty()) {
//             await issue.save();
//             const issues = await Issue.find({ _id: issueId});
//             res.render('issue-list', {
//                 title: 'Issues',
//                 user,
//                 issues,
//                 csrfToken: req.csrfToken()
//             });
//             } else {
//             const errors = validatorErrors.array().map((error) => error.msg);
//             res.render('issue-update', {
//                 title: 'Issue Update',
//                 issue,
//                 user,
//                 errors,
//                 csrfToken: req.csrfToken()
//             });
//         }
//     } catch (err) {
//         next(err);
//     }
// }))

// GET form to delete issue
router.get('/:userid/issue/:issueId/delete', csrfProtection, updateIssueValidators, async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        const user = { _id: req.params.userid };
        return res.status(200).render('issue-delete', {
            title: 'Delete Issue',
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
        return res.status(302).redirect(`/user/${req.params.userid}/issue`);
    } catch (err) {
        next(err)
    }
}))

module.exports = router;
