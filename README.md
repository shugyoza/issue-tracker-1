# issue-tracker-1

## LOG
### 20220207
* Problem: 'ForbiddenError: invalid csrf token'
Cause: omitted 'csrfToken: req.csrfToken()' within the res.render in the GET form route handler so the POST route handler did not see any token when it's time to POST.
* Problem: POST on update issue does not work, instead the URL got duplicated in the browser address when update button clicked.
Cause: Missing '/' on the form action

### 20220214
* MongoId validation for route path (req.params.userid and req.params.issueId) implemented

### 20220215
* Problem: After I logged in, when I clicked Find, or Add, the `${user._id}` within
the anchor link was evaluated as 'undefined', thus user will be kicked out into a login page again, despite we should have a valid user._id as a mongo id.
Cause: Missing 'await' before the `User.findById(...)` in the GET route handler.
* The above problem led me to discover that a button to refresh page (to clear the fields) could be given an onclick='window.location.reload()' instead of providing an href link to that same url address.
Ref: https://stackoverflow.com/questions/29884654/button-that-refreshes-the-page-on-click
* Mongoose.model automatically call Model.init() to build indexes
* Color theme should be: Create/Open: Green, Reset/Cancel: Orange, Find: Purple, Edit/Update: Blue, Delete/Close: Red.
* I must take No BS approach. If something is not necessary, functionally, may as well omit/delete it from existence.
* Top bookmarks should be of a fixed amount as the margin between them and the div.container differs on different amount of bookmarks.


## USER STORIES:
### Done:

#### As a user I want:
* to be able create a user account with as minimum detail possible for the sake of convenience. I can add on my info later.
* to be able to login with my email as my username. I hate having memorizing username.

#### As an admin I want:
* to enforce rules on user data input. If input is not rules compliant, the app must reject the input, throw the error, and have the user fix the input before another re-insert effort into database
* user to access pages using the available provided resources (a links, and button) instead of typing randomly on browser address. Invalid params should be redirected to purported page (e.g. login) or just throw 404 error.


* As a user I want to be able

### To Do:

#### As a User, I want:
* to be able click on an issue in the list of issues and see more details (including comments from others, deadline, progress, history, etc.);
* to be able see the list of issues assigned to me;
* to be able see the list of issues I created;
* to be able to see the teams involved in this issue;
* to be able resize the text size smaller for more display
* to be able to format my writing in the Description field;

#### As an Admin, I want:
* user to input valid email address;
* user to input valid name. No numeric characters;
* user to make sure they input the correct password they wanted on account creation;
#### As a Developer, I want:
* to be able to do unit test on my controller functions;
* to be able to do function test on my route handlers;
