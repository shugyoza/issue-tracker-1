const { check } = require('express-validator');

// validator for login existing user
const loginValidators = [
    check('email')
    .exists({ checkFalsy: true })
    .withMessage('Email must be filled.')
    .isLength({ max: 255 })
    .withMessage('Invalid email address.'),
    check('password')
    .exists({ checkFalsy: true })
    .withMessage('Password to login must be filled.')
    .isLength({ max: 100 })
    .withMessage('Invalid password.')
];

// validator for registering new user
const userValidators = [
    check('first_name')
    .exists({ checkFalsy: true })
    .withMessage('First Name must be filled.')
    .isLength({ max: 100 })
    .withMessage('First Name must be less than 100 characters long.'),
    check('last_name')
    .exists({ checkFalsy: true })
    .withMessage('Last Name must be filled.')
    .isLength({ max: 100 })
    .withMessage('Last Name must be less than 100 characters long.'),
    check('email')
    .exists({ checkFalsy: true })
    .withMessage('Email must be filled.')
    .isLength({ max: 255 })
    .withMessage('Email cannot be that long.'),
    check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please fill in new Password.')
    .isLength({ max: 100 })
    .withMessage('Password cannot be that long.')
];

// validator for new issue input
const issueValidators = [
    check('project')
    .exists({ checkFalsy: true })
    .withMessage('Project name must be filled.')
    .isLength({ max: 100 })
    .withMessage('Project name must be less than 100 characters.'),
    check('issue_type')
    .exists({ checkFalsy: true })
    .withMessage('You must select an Issue Type.'),
    check('summary')
    .exists({ checkFalsy: true })
    .withMessage('Summary must be filled.')
    .isLength({ max: 255 })
    .withMessage('Summary must be less than 255 characters.'),
    check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description must be filled.')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters.'),
    check('reporter')
    .exists({ checkFalsy: true })
    .withMessage('Reporter name is required.')
    .isLength({ max: 255 }),
    check('status')
    .exists({ checkFalsy: true })
    .withMessage('You must select a Status.')
];

exports.loginValidators = loginValidators;
exports.userValidators = userValidators;
exports.issueValidators = issueValidators;
