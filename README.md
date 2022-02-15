# issue-tracker-1
20220207
Problem: 'ForbiddenError: invalid csrf token'
Cause: omitted 'csrfToken: req.csrfToken()' within the res.render in the GET form route handler so the POST route handler did not see any token when it's time to POST.

Problem: POST on update issue does not work, instead the URL got duplicated in the browser address when update button clicked.
Cause: Missing '/' on the form action

20220214
MongoId validation for route path (req.params.userid and req.params.issueId) implemented

20220215
Problem: After I logged in, when I clicked Find, or Add, the `${user._id}` within
the anchor link was evaluated as 'undefined', thus user will be kicked out into a login page again, despite we should have a valid user._id as a mongo id.
Cause: Missing 'await' before the `User.findById(...)` in the GET route handler.

The above problem led me to discover that a button to refresh page (to clear the fields) could be given an onclick='window.location.reload()' instead of providing an href link to that same url address.
Ref: https://stackoverflow.com/questions/29884654/button-that-refreshes-the-page-on-click
