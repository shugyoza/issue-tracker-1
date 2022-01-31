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
    issue_title: {
        type: String,
        trim: true,
        required: [true, 'Issue title is required.']
    },
    issue_text: {
        type: String,
        trim: true,
        required: [true, 'Issue text is required']
    },
    created_by: {
        type: String,
        trim: true,
        required: [true, 'Created by is required.']
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    },
    assigned_to: String,
    open: {
        type: Boolean,
        default: true
    },
    status_text: {
        type: String,
        default: 'Initiated.'
    }
})

module.exports = mongoose.model('Issue', issueSchema)
