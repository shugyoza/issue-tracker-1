'use strict'
const   express = require('express'),
        csrf = require('csurf'),
        { validationResult } = require('express-validator')

const   User = require('../db/models/user'),
        Issue = require('../db/models/issue'),
        Funct = require('../controllers/functions.js');

const { userValidators, issueValidators } = require('../controllers/validator.js');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });
let funct = new Funct();

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

// GET list of all issues made under this user
router.get('/:userid/:issue', async (req, res, next) => {
    try {
        let q;
        if (!funct.isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        if (req.params.issue && req.query.q) {
            // turn the string into a valid object for querying database
            q = funct.objectify_url_query_str(req.query.q);
        }
        const issues = await Issue.find(q);
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
        const issue = { reporter: `${user.first_name} ${user.last_name}`};
        return res.status(200).render('issue-add', {
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
    const user = { _id: req.params.userid };
    const issue = new Issue({
        project: project,
        issue_type,
        summary: summary,
        description: description,
        priority: priority,
        reporter: reporter,
        assignee: assignee,
        status: status,
        created: new Date(),    // default value
        updated: new Date(),    // default value
        archived: false,        // default value
        log: [{                 // default value
                project: project,
                issue_type,
                summary: summary,
                description: description,
                priority: priority,
                reporter: reporter,
                assignee: assignee,
                status: status,
                created: new Date(),
                archived: false,
                inputter_id: req.params.userid
        }],
        inputter_id: req.params.userid
    });
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
        const issue = { };
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
router.post('/:userid/:issue/find', csrfProtection, asyncHandler(async (req, res, next) => {
    try {
        let queryObj = funct.getInput(req.body);
        if (!queryObj) {
            return res.status(302).redirect(`/user/${req.params.userid}/issue`);
        }
        let queryStr = funct.stringify_obj_into_url_query_str(queryObj);
        return res.status(302).redirect(`/user/${req.params.userid}/issue?q=${queryStr}`)
    } catch (err) {
        next(err);
    }
}))

// GET form to update issue
router.get('/:userid/issue/:issueId/update', csrfProtection, async (req, res, next) => {
    try {
        const issue = await Issue.findById({ _id: req.params.issueId });
        const user = { _id: req.params.userid };
        const logs = issue.log.reverse();
        return res.status(200).render('issue-update', {
            title: 'Update Issue',
            current_issue_type: issue.issue_type,
            current_description: issue.description,
            current_priority: issue.priority,
            current_status: issue.status,
            logs,
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
        let issue = await Issue.findById(req.params.issueId);
        const user = { _id: req.params.userid },
              validatorErrors = validationResult(req),
              { project, issue_type, summary, description, reporter, priority, assignee, status } = req.body;
        let [ count, update, archived ] = funct.getUpdate(issue, req.body)
        // if there's no update
        if (count === 0) {
            validatorErrors.errors.push({
                value: description,
                msg: 'You inputted nothing for an update.',
                param: 'description',
                location: 'body'
            });
        }
        console.log(count, update, archived)
        const errors = validatorErrors.array().map((error) => error.msg);
        if (!validatorErrors.isEmpty() || errors.length) {
            return res.status(400).render('issue-update', {
                title: 'Issue Update',
                issue,
                user,
                errors,
                csrfToken: req.csrfToken()
            });
        }
        // if there's no error, and there's update, we'll insert what's being updated into the log
        issue.updated = update.updated = new Date();
        issue.inputter_id = update.inputter_id = req.params.userid;
        issue.log.push(update);
        await issue.save();
        let logs = issue.log.reverse();
        return res.status(200).render('issue-update', {
            title: 'Issues',
            successMsg: 'Update success!',
            current_issue_type: issue.issue_type,
            current_description: issue.description,
            current_priority: issue.priority,
            current_status: issue.status,
            logs,
            user,
            issue,
            csrfToken: req.csrfToken()
        });
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
router.get('/:userid/issue/:issueId/delete', csrfProtection, issueValidators, async (req, res, next) => {
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
