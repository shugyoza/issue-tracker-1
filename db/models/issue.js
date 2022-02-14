'use strict';
let mongoose;
try {
    mongoose = require('mongoose');
} catch(err) {
    console.log(err)
};
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const { Schema } = mongoose;

const issueSchema = new Schema({
    project: String,
    issue_type: {
        type: String,
        trim: true,
        required: [true, 'Issue Type is required.']
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Issue Summary is required.']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Description is required.']
    },
    reporter: {
        type: String,
        trim: true,
        required: [true, 'Created by is required.']
    },
    priority: {
        type: String,
        trim: true,
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    assignee: String,
    open: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'New Issue.'
    },
    log: [{
        description: String,
        date: Date
    }],
    userid: {
        type: String,
        trim: true
    }
})

module.exports = mongoose.model('Issue', issueSchema)
