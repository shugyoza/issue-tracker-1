'use strict'
const express = require('express')
    , { validationResult } = require('express-validator');

const User = require('../db/models/user')
    , Issue = require('../db/models/issue')
    , {
        asyncHandler,
        csrfProtection,
        isValidId,
        getInput,
        stringify_obj_into_url_query_str,
        objectify_url_query_str,
        update
    } = require('../controllers/utils')
    , { userValidators, issueValidators } = require('../controllers/validator.js');

const router = express.Router();

// GET list of all issues made under this user
router.get('/:userid/:issue', async (req, res, next) => {
    try {
        let q;
        if (!isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        // if (req.query.q) {
        if (req.params.issue === 'issue' && Object.keys(req.query).length) {
            // turn the string into a valid object for querying database
            q = objectify_url_query_str(req.query)// (req.query.q);
            console.log(31, q, req.query)
        }
        const issues = await Issue.find(req.query);// (q);
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
        if (!isValidId(req.params.userid)) {
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
        issue_type: issue_type,
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
                issue_type: issue_type,
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
        console.log('before issue.save')
        await issue.save();
        console.log('after issue.save')
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
        if (!isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        const user = await User.findById(req.params.userid),
              issue = {},
              placeholder = {
                  project: '- exact match only -',
                  summary: '- exact match only -',
                  description: '- We are still working on this search by Description feature. -',
                  reporter: '- exact match only -',
                  assignee: '- exact match only -',
                 };
        return res.status(200).render('issue-find', {
            title: 'Find Issue',
            placeholder,
            user,
            issue,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
});

// POST form to find issue(s) with a set of criteria
router.post('/:userid/issue/find', csrfProtection, asyncHandler(async (req, res, next) => {
    try {
        let queryObj = getInput(req.body);
        if (!queryObj) {
            return res.status(302).redirect(`/user/${req.params.userid}/issue`);
        }
        let queryStr = stringify_obj_into_url_query_str(queryObj);
        console.log(154, queryStr)
        return res.status(302).redirect(`/user/${req.params.userid}/issue?${queryStr}`) // (`/user/${req.params.userid}/issue?q=${queryStr}`)
    } catch (err) {
        next(err);
    }
}))

// GET form to update issue
router.get('/:userid/issue/:issueId/update', csrfProtection, async (req, res, next) => {
    try {
        if (!isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        const user = await User.findById(req.params.userid);
        if (!user) {
            // redirect to user create with error message
            return res.status(302).redirect('/user/add')
        }
        if (user && !isValidId(req.params.issueId)) {
            // should include error message why the redirect
            return res.status(302).redirect(`/user/${req.params.userid}/issue?err=issue-not-exist`);
        }
        const issue = await Issue.findById(req.params.issueId);
        if (user && !issue) {
            return res.status(302).redirect(`/user/${req.params.userid}/issue?err=issue-not-exist`);
        }
        const logs = issue.log.reverse(),
        placeholder = {
            project: '',
            summary: '',
            description: '',
            reporter: '',
            assignee: '',
        };
        return res.status(200).render('issue-update', {
            title: 'Update Issue',
            current_issue_type: issue.issue_type,
            current_description: issue.description,
            current_priority: issue.priority,
            current_status: issue.status,
            placeholder,
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
              { project, issue_type, summary, description, reporter, priority, assignee, status } = req.body,
              placeholder = {
                project: '',
                summary: '',
                description: '',
                reporter: '',
                assignee: '',
            };

        let [ count, updateObj, archived ] = update(issue, req.body);
        // if there's no update
        if (count === 0) {
            validatorErrors.errors.push({
                value: description,
                msg: 'You inputted nothing for an update.',
                param: 'description',
                location: 'body'
            });
        }
        const errors = validatorErrors.array().map((error) => error.msg);
        if (!validatorErrors.isEmpty() || errors.length) {
            return res.status(400).render('issue-update', {
                title: 'Issue Update',
                placeholder,
                issue,
                user,
                errors,
                csrfToken: req.csrfToken()
            });
        }
        // if there's no error, and there's update, we'll insert what's being updated into the log
        issue.updated = updateObj.updated = new Date();
        issue.inputter_id = updateObj.inputter_id = req.params.userid;
        issue.log.push(updateObj);
        await issue.save();
        let logs = issue.log.reverse();
        return res.status(200).render('issue-update', {
            title: 'Issues',
            successMsg: 'Update success!',
            current_issue_type: issue.issue_type,
            current_description: issue.description,
            current_priority: issue.priority,
            current_status: issue.status,
            placeholder,
            logs,
            user,
            issue,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        next(err);
    }
}))

// GET form to delete issue
router.get('/:userid/issue/:issueId/delete', csrfProtection, async (req, res, next) => {
    try {
        if (!isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        const user = await User.findById(req.params.userid);
        if (!user) {
            // redirect to user create with error message
            return res.status(302).redirect('/user/add')
        }
        if (user && !isValidId(req.params.issueId)) {
            // should include error message why the redirect
            return res.status(302).redirect(`/user/${req.params.userid}/issue?err=issue-not-exist`);
        }
        const issue = await Issue.findById(req.params.issueId);
        if (user && !issue) {
            return res.status(302).redirect(`/user/${req.params.userid}/issue?err=issue-not-exist`);
        }
        const placeholder = {
            project: '',
            summary: '',
            description: '',
            reporter: '',
            assignee: '',
        };
        let logs = issue.log.reverse();
        return res.status(200).render('issue-delete', {
            title: 'Delete Issue',
            placeholder,
            logs,
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
