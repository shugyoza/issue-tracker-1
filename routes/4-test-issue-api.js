'use strict'
const express = require('express')
    , { validationResult } = require('express-validator');

const User = require('../db/models/user')
    , Issue = require('../db/models/issue')
    , {
        asyncHandler,
        isValidId,
        getInput,
        stringify_obj_into_url_query_str,
        objectify_url_query_str,
        update,
    } = require('../controllers/utils')
    , { userValidators, issueValidators } = require('../controllers/validator.js');

const router = express.Router();

// GET list of all issues made under this user
router.get('/user/:userid/issue', async (req, res, next) => {
    try {
        let q;
        if (!isValidId(req.params.userid)) {
            return res.status(302).redirect('/user/login?bool=false');
        }
        if (req.params.issue && req.query.q) {
            // turn the string into a valid object for querying database
            q = objectify_url_query_str(req.query.q);
        }
        const issues = await Issue.find(q);
        const user = { _id: req.params.userid };
        return res.status(200).json({ issues: issues });
    } catch (err) {
        next(err);
    }
})

// POST form to add issue from user dashboard
router.post('/user/:userid/issue/add', issueValidators, asyncHandler(async(req, res) => {
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
        await issue.save();
//        return res.status(302).redirect(`/user/${user._id}/issue`);
        return res.status(200).json(issue);
    } else {
        const errors = validatorErrors.array().map((error) => error.msg);
        return res.status(400).json({
            title: 'Add Issue',
            issue,
            user,
            errors,
        });
    }
}))

// POST form to find issue(s) with a set of criteria
router.post('/user/:userid/issue/find', asyncHandler(async (req, res, next) => {
    try {
        let queryObj = getInput(req.body);
        if (!queryObj) {
            return res.status(302).redirect(`/user/${req.params.userid}/issue`);
        }
        let queryStr = stringify_obj_into_url_query_str(queryObj);
        return res.status(302).redirect(`/user/${req.params.userid}/issue?q=${queryStr}`)
    } catch (err) {
        next(err);
    }
}))

// POST form to update issue.
router.post('/user/:userid/issue/:issueId/update', issueValidators, asyncHandler(async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.issueId);
        const user = { _id: req.params.userid },
              validatorErrors = validationResult(req),
              { project, issue_type, summary, description, reporter, priority, assignee, status } = req.body;
        let [ count, updateObj, archived ] = update(issue, req.body)
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
                issue,
                user,
                errors,
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
            logs,
            user,
            issue,
        });
    } catch (err) {
        next(err);
    }
}))

// POST form to delete issue
router.post('/user/:userid/issue/:issueId/delete', asyncHandler(async (req, res, next) => {
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
