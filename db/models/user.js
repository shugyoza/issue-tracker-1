'use strict';
let mongoose;
try {
    mongoose = require('mongoose');
} catch(err) {
    console.log(err)
}
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const { Schema } = mongoose;

const userSchema = new Schema({
    first_name: {
        type: String,
        trim: true,
        required: [true, 'First name is required.']
    },
    last_name: {
        type: String,
        trim: true,
        required: [true, 'Last Name is required']
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'Email is required']
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Password is required']
    }
})

module.exports = mongoose.model('User', userSchema)
