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
    project: {
        type: String,
        trim: true,
        required: [true, 'Project Name is required.']
    },
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
    reporter: { // the person on whose behalf input were submitted
        type: String,
        trim: true,
        required: [true, 'Reporter is required.']
    },
    priority: {
        type: String,
        trim: true,
        required: [true, 'Priority is required.']
    },
    created: {
        type: Date
    },
    updated: {
        type: Date
    },
    assignee: String,
    archived: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        trim: true,
        required: [true, 'Status is required.']
    },
    log: [],
    inputter_id: {
        type: String,
        trim: true
    }
})

module.exports = mongoose.model('Issue', issueSchema)
