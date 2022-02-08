# issue-tracker-1
20220207
Problem: 'ForbiddenError: invalid csrf token'
Cause: omitted 'csrfToken: req.csrfToken()' within the res.render in the GET form route handler so the POST route handler did not see any token when it's time to POST.

Problem: POST on update issue does not work, instead the URL got duplicated in the browser address when update button clicked.
Cause: Missing '/' on the form action
