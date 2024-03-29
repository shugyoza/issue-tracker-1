# issue-tracker-1

## SETUP IN LOCAL SERVER (LOCAL COMPUTER USE ONLY)

The process to setup the app in the computer terminal is as follows:

- Go to the directory (folder) where you want to install the app;
- Type: `git clone https://github.com/shugyoza/issue-tracker-1.git`
- Enter the issue-tracker-1 directory. Type: `cd issue-tracker-1`
- If yout type: `ls`, you'll see something like this in the issue-tracker-1 directory.

```
terminal-moniker-10% cd issue-tracker-1
terminal-moniker-10% ls
README.md		package-lock.json	sample.env
app.js			package.json		test
controllers		public			views
db			routes
```

- Install dependencies, type: `npm install`
  You'll see something like this in your terminal afterwards.

```
> nodemon@2.0.15 postinstall /Users/stephenhanjaya/Documents/TOP/issue-tracker-1/node_modules/nodemon
> node bin/postinstall || exit 0

added 422 packages from 273 contributors and audited 422 packages in 12.786s

51 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

- If you type: `ls` again, you'll see `node_modules` directory now.

```
terminal-moniker-10% ls
README.md		node_modules		routes
app.js			package-lock.json	sample.env
controllers		package.json		test
db			public			views
```

- Create your own MongoDB database to interact with this app and store data.
  - Login to mongodb.com
  - For creating a database, refer to this link: https://www.mongodb.com/basics/create-database
  - If you need to create a database user, in your user Dashboard:
    - click: `Database Access`, then
    - click `+Add New Database User`, then
    - type your new username and password in corresponding fields, and click ` Add User`
  - Once data base created:
    - click: `Database`, then
    - click: `Connect`, then
    - click: `Connect your application`, then
    - you'll see something like this: `mongodb+srv://<username>:<password>@cluster0.5lubw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    - replace `<username>`, `<password>` and `myFirstDatabase` with your own database username, database password, and database name, then
    - copy that customized mongo string
- You need to create a file named: `.env` in the `issue-tracker-1` directory.
  - Back in your computer terminal, go to `issue-tracker-1` folder with `cd` command as we've used previously, then
    - fire up your code editor
    - make a copy of the `sample.env` file, then
    - open the copy of `sample.env` file with your text editor, then
    - fill in the `PORT=` with any four digit number, most common: 3000, 5000, 8000, or 8080, no space in between! and no quotes!, then
    - paste the mongo string you copied and customized previously to the `MONGO_URI=`, again, no space in between! and no quotes!, then
    - after your edit, it'll look something like this:
    ```
    PORT=5000
    MONGO_URI=mongodb+srv://your_database_username:your_database_user_password@cluster0.5lubw.mongodb.net/your_database_name?retryWrites=true&w=majority
    ```
    - save it, then
    - rename the file to be: `.env`
    - once renamed, the file should be hidden from plain sight in the file-finder / window-explorer, unless you've st the file-finder / window-explorer to be able to view hidden files.
- At this point you're done setting up. Back in your computer terminal, within the `issue-tracker-1` directory, type: `npm start`, then
- Open your favorite browser, and type: `localhost:5000`. You should've seen a login page of the app by now, which means you're done done. Time to play!
- To stop the local server, in that computer terminal where you typed `npm start` type `ctrl C`. (Always shutdown before closing the terminal).
- **REMARKS!**
  - Whenever you want to have this app in your online Git Repository, always.. always.. do as follows prior to pushing to the online repository:
    - create a file name `.gitignore`, then
    - open it with your code editor, and add: `/node_modules/` on the first line (you don't want to upload the whole bunch of gigabytes of files in /node_modules/ folder!, and
    - add `.env` on the next line (you don't want the whole world knows your username and password for your database! duh!), and
    - SAVE it!, Your `.gitignore` file should then have the following lines within it:
    ```
    /node_modules/
    .env
    ```
  - All the tests on the app is in the `test` directory, if you want to add some more tests. To run the test specs, follow the above steps, only that you have to type `npm test` instead of `npm start`, and type `ctrl C` once you're done.

## PROJECT NOTE

- I decided to build this app because I believe I can use it to develop other similar apps, e.g. (CRM for Sales/Real Estate, Case Management for Companies/Law Firm);
- It has been created with focus on accessibility, thus the font size, the color contrast, less picture/video, and the effort to refer to HTML semantics appropriately (e.g. button, h, and a tags);
- This would be the first milestone. Future development shall be done on another repo. It had been designed without outlook of using authentication library. Having to know how authentication works, thus I stop here, because I believe I would do a major reconstruction on the design (e.g. route paths, use of less templates and more dynamic feature of pug -
  to make it more modular);
- I refer a lot to Google Issue Tracker and Jira in developing this app;
- Most difficult challenges in developing this app is:
  - First, Design (Schema and Routes), considering use case, efficiency, efficacy, readability, usability, maintainability, and scalability. Specifically in this case, lack of experience substantially made it more difficult;
  - Second, figuring out the edge case for testing;
  - Third, organizing the codes to be tidy, not cluttered, yet not maze-like complicated due to using lots of references;
  - Fourth, not knowing a lot of things and how to use methods certainly is another handicap (e.g. using promises in Chai, acquiring document id for delete/update);
- At one point of scaling, with lots of one / many to many / one relation, I believe Relational Database would fit better for this app. For the moment, No SQL database like Mongo suffice;
- I love colors, everyone love colors, but too much is too much. I love that I came up with this file binder layout. The error message (and buttons) I made to look like a post-it note, and the white div to contain user profile and history updates, I made them to look like a mailing label. Sometimes it feels too simple, but it's okay;
- Although currend trend has left it, I still love subtle shadows, to add the 3D feels on the app;
- I don't use media queries for responsive web design, but I think this app quite liquid and flexible enough to display aesthetically in most screens dimension without breaking apart. For sure there are shortcomings. Everything is a compromise.
- If you happened to check and play this app, and have any suggestion to make it better, please let me know! Thanks!

## USER STORIES:

### Done:

#### As a User I want:

- to be able create a user account with as minimum detail possible for the sake of convenience. I can add on my info later;
- to be able to login with my email as my username. I hate having memorizing username;
- to be able see all the issues listed in a single click;
- to be able see all the issues from most recent one created;
- to be able see within the list: the project name, issue type, summary, description, status, last updated time, who reported the issue, and to whom it is assigned;
- to be able to click update on an issue in the list and update it;
- to be able to click delete on an issue in the list and delete it;
- when I clicked update issue, I want to see an update page with all the fields prefilled with what's existing in the database;
- when I clicked delete issue, I want to see a page of the issue with a confirmation alert whether I'd really want to delete the issue;
- to be able to log out whenever and wherever I am in the app;
- to be able see the update history in each issue page;

#### As an admin I want:

- to enforce rules on user data input. If input is not rules compliant, the app must reject the input, throw the error, and have the user fix the input before another re-insert effort into database
- user to access pages using the available provided resources (a links, and button) instead of typing randomly on browser address. Invalid params should be redirected to purported page (e.g. login) or just throw 404 error.

### To Do:

#### As a User, I want:

- to be able click on an issue in the list of issues and see more details (including comments from others, deadline, progress, history, etc.);
- to be able see the list of issues assigned to me;
- to be able see the list of issues I created;
- to be able to see the teams involved in this issue;
- to be able resize the text size smaller for more display
- to be able to format my writing in the Description field;
- to be able to have others in the team to comment on this issue, vice versa (eh.. now it became instagram, lol);

#### As an Admin, I want:

- user to input valid email address; (The best validation is by sending a confirmation email to user's email and have the user clicked on the link within that email)
- user to input valid name. No numeric characters;
- user to make sure they input the correct password they wanted on account creation;

#### As a Developer, I want:

- to be able to do unit test on my controller functions;
- to be able to do function test on my route handlers;

## ROUTES

- GET at `/`
- GET at `/user/super`
- GET and POST at `/user/login`
- GET and POST at `/user/add`
- GET at `/user/:userid`
- GET and POST (PUT) at `/user/:userid/edit`
- GET and POST (DELETE) at `/user/:userid/delete`
- GET and POST (DELETE) at `user/delete/:userid`
- POST (DELETE) at `/logout` (not implemented, later in session and authentication)

- GET at `/:userid/issue`
- GET and POST at `/user/:userid/issue/add`
- GET and POST at `/user/:userid/issue/find`
- GET and POST (PUT) at `/user/:userid/issue/:issueId/update`
- GET and POST (DELETE) at `/user/:userid/issue/:issueId/delete`

- For test purpose, other routes added to check the returned data:
  - GET at `/test/user/super`
  - POST at `/test/user/login`
  - POST at `/test/user/add`
  - POST (PUT) at `/test/user/:userid/edit`
  - POST (DELETE) at `/test/user/:userid/delete` (test not implemented yet)
  - POST at `/test/user/:userid/issue/add`
  - POST (PUT) at `/test/user/:userid/issue/:issueId/update` (test not implemented yet)
  - POST (DELETE) at `/test/user/:userid/issue/:issueId/delete` (test not implemented yet)

## LOG

### 20220207

- Problem: 'ForbiddenError: invalid csrf token'
  Cause: omitted 'csrfToken: req.csrfToken()' within the res.render in the GET form route handler so the POST route handler did not see any token when it's time to POST.
- Problem: POST on update issue does not work, instead the URL got duplicated in the browser address when update button clicked.
  Cause: Missing '/' on the form action

### 20220214

- MongoId validation for route path (req.params.userid and req.params.issueId) implemented

### 20220215

- Problem: After I logged in, when I clicked Find, or Add, the `${user._id}` within
  the anchor link was evaluated as 'undefined', thus user will be kicked out into a login page again, despite we should have a valid user.\_id as a mongo id.
  Cause: Missing 'await' before the `User.findById(...)` in the GET route handler.
- The above problem led me to discover that a button to refresh page (to clear the fields) could be given an onclick='window.location.reload()' instead of providing an href link to that same url address.
  Ref: https://stackoverflow.com/questions/29884654/button-that-refreshes-the-page-on-click
- Mongoose.model automatically call Model.init() to build indexes
- Color theme should be: Create/Open: Green, Reset/Cancel: Orange, Find: Purple, Edit/Update: Blue, Delete/Close: Red.
- I must take No BS approach. If something is not necessary, functionally, may as well omit/delete it from existence.
- Top bookmarks should be of a fixed amount as the margin between them and the div.container differs on different amount of bookmarks.

### 20220218

- Problem: Console prints a SyntaxError: Invalid shorthand property initializer when I added { ... successMsg = '...', ... } in res.render.
  Cause: It should have been a ':' instead of '='

### 20220219

- Problem: When writing chai-http test, got this error

```
Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises
Warning: .end() was called twice. This is not supported in superagent
superagent: double callback bug
```

Probable cause: .catch((err)) => throw err as follows

```
    test('GET /user/login', (done) => {
        chai
            .request(app)
            .get('/user/login')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                done();
            })
            .catch((err) => {
                throw err;
            })
    })

```

If we have this instead, works fine.

```
    test('GET /user/login', (done) => {
        chai
            .request(app)
            .get('/user/login')
            .end((err, res) => {
                if (err) done(err)
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                done();
            })
    })
```

### 20220220

- Problem: Having a 403 Forbidden Error on any Chai POST route test.
  Probable cause: we need to include \_csrf token in the POST request that match the \_csrf on GET request.
  Conclusion: YES, 403 error is related to csrf. We need to have our test wrapped with chai.request.agent.

```
const agent = chai.request.agent(app)

agent.get('/singup').end((err, res) => {
  // do some tests and get the token
  // ...
  // the agent will use the cookie from the previous request
  // so you only need to set the CSRF-Token header
  agent.post('/singup')
    .set('CSRF-Token', _csrf)
    .send({ username: 'me', password: '123' })
    .end((err, res) => {
       // handle the post response
    })
})

agent.close()
```

Reference: https://stackoverflow.com/questions/70817611/how-to-test-http-api-that-uses-csurf-csrf-protection-with-mocha-chai

### 20220221

- Problem: Having an error

```
UnhandledPromiseRejectionWarning: MongooseError: The `uri` parameter to `openUri()` must be a string, got "undefined". Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.
```

Cause: Missing a

```
require('dotenv').config();
```

### 20220222

- Problem: Getting a "ReferenceError: mongoose is not defined" in connection.js

```
const { MongoClient } = require('mongodb'); // throw ReferenceError: mongoose is not defined
async function main(callback) {
    const URI = process.env.MONGO_URI;
    const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });
```

Fix: Import: const mongoose = require('mongoose) and it works.
I tried to change "new MongoClient" into "mongoose.connect", because it looks confusing (import mongoose does not match new MongoClient), but got a
"TypeError: client.connect is not a function" instead.

- Problem: Got an

```
Assertion failed: You must provide either mongoUrl|clientPromise|client in options
/Users/stephenhanjaya/Documents/myProject/issue-tracker-1/node_modules/connect-mongo/build/main/lib/MongoStore.js:119
            throw new Error('Cannot init client. Please provide correct options');
Error: Cannot init client. Please provide correct options at new MongoStore...
```

Cause: the options key in MongoStore.create must be correct (no typo).

```
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    key: 'express.sid',
    cookie: { // secure: false }
        maxAge: 1000 * 60 * 60 * 24 // == one day == 24 hours
    }
}));
```

### 20220223

Problem: Incorporating Passport Local Strategy Authentication. Most tutorials gave starter package, or include set up with database, and all of them are confusing, with magical variable names.
Solution: This one reference is quite simple to digest. Eliminating all the unnecessaries, so I could tweak and debug it to fit and work on my app. Ref: https://youtu.be/-RCnNyD0L-s

### 20220224

- Spent the whole day trying to make the logout function works deleting cookie and session.
  Problem: I used `button(formaction='/user/logout/' method='post') but the button did not seem to respond at all.
  Cause: Simple thing. Pug DOES NOT accept 'formaction' attribute!!!! (Learned it after I tried poking around creating a simple form as desperate effort)
  Solution: Must create a simple form to nest the button.
- Another link for learning Passport-JS Local strategy: https://levelup.gitconnected.com/everything-you-need-to-know-about-the-passport-local-passport-js-strategy-633bbab6195 with https://www.youtube.com/watch?v=fGrSmBk9v-4&list=PLYQSCk-qyTW2ewJ05f_GKHtTIzjynDgjK&index=7
- passport.authenticate('-strategyName, {...}) is a middleware with options. We can just do e.g.:

```
router.post('/login', checkNotAuthenticated, csrfProtection, loginValidators, passport.authenticate('local', {
    successRedirect: `/user/...`,
    failureRedirect: '/user/login',
    failureFlash: true
});
```

OR still handle the req, res after it, e.g.:

```
router.post('/login', checkNotAuthenticated, csrfProtection, loginValidators, passport.authenticate('local', {
    // successRedirect: `/user/${req.session.passport.user}`, // I cannot have this since the app already built with /:userid for redirect.
    // failureRedirect: '/user/login',
    failureFlash: true
}), asyncHandler(async(req, res) => {
    const user = await User.find({ email: req.body.email });
    res.status(302).redirect(`/user/${user._id}`)
}))

```

### 20220225

- I decided to stop development on this repo and made this repo to be the first milestone. Ripped out all the authentication feature for passport js, deleted unnecessary files and commented out codes are pooled into the \_trash. Deleted the GET requests in the test-user-api.js as that file was created for testing the return result of the post request, does they all are returning application/json instead of text/html.

### 20220411

- POST request on /user/:userId/issue/add on Heroku throws error: 500 with no log in the Heroku CLI although it works on localhost.
Hypotheses: For sure the problem is not in my code, but rather in Heroku. Quite probably was caused by something in heroku got updated into a new version and caused the error
Action:
- set to maintenance mode
- delete the Buildpacks in setting for heroku/nodejs
- add a new heroku/nodejs buildpack
- redeployed
- disable maintenance mode
- it works.

### 20220412
- POST on issue/find did not yield the expected result in correspond to the req.query
Cause: the callback function to stringify the query object did not return the correct string, e.g. `issue?q=priority:high%20reporter:Stephen%20Hanjaya`
Fixed the callback to return this query string e.g. `issue?priority=high&reporter=Stephen%20Hanjaya` which turned into the correct req.query on redirect to /:userId/issue
