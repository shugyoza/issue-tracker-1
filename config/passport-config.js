const LocalStrategy = require('passport-local').Strategy
    , bcrypt = require('bcrypt')
    , User = require('../db/models/user')


const initialize = (passport, getUserByEmail, getUserById) => {

    const authenticateUser = async (email, password, done) => {
        console.log(9, !email, !password)
        const user = await getUserByEmail(email, User); // ok
        if (user == null) {
            return done(null, false, { message: 'No user with that email.'})
        }
        try {
            // console.log(["passport.config", 12, user, password, user.password]) // ok
            let checkPassword = await bcrypt.compare(password, user.password) // ok
            // console.log([16, 'passport.config', checkPassword]) // ok
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password Incorrect.'})
            }
        } catch (err) {
            return done(err);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser(function(user, done) {
        done(null, user._id); // (user, done) => done(null, user._id))
    });
    // passport.deserializeUser((_id, done) => { // does not work. returns undefined.
    //     return done(null, getUserById(_id, User))
    // });
    passport.deserializeUser(function(_id, done) {
        User.findById(_id, function(err, user) {
            done(err, user);
        })
    })
};

module.exports = initialize;
