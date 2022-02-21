const ObjectId = require('mongodb').ObjectId;

function Auth() {
    this.serializ
}

module.exports = Auth;

/* const User = require('../db/models/user');


function Auth() {

    this.loginUser = (req, res, user) => {
        req.session.auth = {
            userId: user._id
        };
    }

    this.logoutUser = (req, res) => {
        delete req.session.auth;
    }

    this.requireAuth = (req, res, next) => {
        if (!res.locals.authenticated) {
            return res.redirect('/user/login');
        }
        return next();
    }

    this.restoreUser = async (req, res, next) => {
        console.log(req.session);
        if (req.session.auth) {
            const { userId } = req.session.auth;
            try {
                const user = await User.findById(userId);
                if (user) {
                    res.locals.authenticated = true;
                    res.locals.user = user;
                    next;
                }
            } catch (err) {
                res.locals.authenticated = false;
                next(err);
            }
        } else {
            res.locals.authenticated = false;
            next();
        }
    }
}

module.exports = Auth;
*/
