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
    title: {
        type: String,
        trim: true,
        required: [true, 'Issue title is required.']
    },
    remark: {
        type: String,
        trim: true,
        required: [true, 'Remark is required.']
    },
    creator: {
        type: String,
        trim: true,
        required: [true, 'Created by is required.']
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
