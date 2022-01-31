'use strict'
const express = require('express');
const csrf = require('csurf');
const { check, validationResult } = require('express-validator');

const Issue = require('../db/models/issue');
const User = require('../db/models/user');

const router = express.Router();

const csrfProtection = csrf({ cookie: true });

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

// web address: root/issue
router.get('/', (req, res, next) => {
    try {
        const issues = await Issue.find({});
        res.render('issue-list', { title: 'Issues', issues });
    } catch (err) {
        next(err);
    }
    // res.send('Birds home page')
})

router.get('/issue/add', csrfProtection, (req, res) => {
    const { project, issue_title, issue_text, created_by, assigned_to } = req.body;
    const issue = new Issue({
        project: project,
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to
    });
})

// web address: root/issue/about
router.get('/about', (req, res) => {
    res.send('About birds')
})
module.exports = router;
