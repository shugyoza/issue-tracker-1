const   chai = require('chai'),
        assert = chai.assert,
        expect = chai.expect;

const app = require('../app');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

let userid = '6216c50ff21fb2c08f1a8b9f';
let issueId = '620e7f84709f599f96b3c7f3';

suite(`HTTP REQUEST TO: '/user/:userid/issue'`, () => {

    test('Valid userid params render all issues in database, status: 200, content-type: text/html', (done) => {
        chai
        .request(app)
        .get(`/user/${userid}/issue`)
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Render all issues in database made by user', (done) => {
        chai
        .request(app)
        .get(`/test/user/${userid}/issue`)
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isArray(res.body.issues, 'A list of issues represented in an array');
            done();
        })
    })

    test('Invalid userid params in browser address forces user to redirect to login page, content-type: text/html', (done) => {
        chai
        .request(app)
        .get(`/user/whateverthisthingis/issue`)
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect;
            assert.equal(res.type, 'text/html');
            done();
        })
    })
})


suite(`HTTP REQUEST TO: '/user/:userid/issue/add'`, () => {

    test('Render file, status: 200, content-type: text/html', (done) => {
        chai
        .request(app)
        .get(`/user/${userid}/issue/add`)
        .end((err, res) => {
            if (err) done(err)
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Invalid userid params in browser address forces user to redirect to login page, content-type: text/html', (done) => {
        chai
        .request(app)
        .get(`/user/whateverthisthingis/issue/add`)
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect;
            assert.equal(res.status, 400);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Adding issue with all fields filled in', (done) => {
        chai
        .request(app)
        .post(`/test/user/${userid}/issue/add`)
        .send({
            project: 'Chai Test',
            issue_type: 'Bug',
            summary: 'Is There any Bug in Issue Tracker Development',
            description: 'We are testing whether there is any bug within the Issue Tracker App using Chai-JS library.',
            priority: 'Medium',
            reporter: 'Tester 1',
            assignee: 'Assistant to Tester 1',
            status: 'Open'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.project, 'Chai Test');
            assert.equal(res.body.issue_type, 'Bug');
            assert.equal(res.body.summary, 'Is There any Bug in Issue Tracker Development');
            assert.equal(res.body.description, 'We are testing whether there is any bug within the Issue Tracker App using Chai-JS library.');
            assert.equal(res.body.priority, 'Medium');
            assert.equal(res.body.reporter, 'Tester 1');
            assert.equal(res.body.assignee, 'Assistant to Tester 1');
            assert.equal(res.body.status, 'Open');
            done();
        })
    })
})


suite(`HTTP REQUEST TO: '/user/:userid/issue/find'`, () => {

    test('Render file, status: 200, content-type: text/html', (done) => {
        chai
        .request(app)
        .get(`/user/${userid}/issue/find`)
        .end((err, res) => {
            if (err) done(err)
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Invalid userid params in browser address forces user to redirect to login page, content-type: text/html', (done) => {
        chai
        .request(app)
        .get(`/user/whateverthisthingis/issue/find`)
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect;
            assert.equal(res.status, 400);
            assert.equal(res.type, 'text/html');
            done();
        })
    })
})


suite(`HTTP REQUEST TO: '/user/:userid/issue/:issueId/update'`, () => {
    let userid, issueId;

    test('Render file, status: 200, content-type: text/html', (done) => {
        userid = '6216c50ff21fb2c08f1a8b9f';
        issueId = '620e7f84709f599f96b3c7f3';
        chai
        .request(app)
        .get(`/user/${userid}/issue/${issueId}/update`)
        .end((err, res) => {
            if (err) done(err)
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Invalid userid params in browser address with valid issueId params ', (done) => {
        userid = 'whateverthisthingis';
        issueId = '620e7f84709f599f96b3c7f3';
        chai
        .request(app)
        .get(`/user/${userid}/issue/${issueId}/update`)
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect; // to login page with error message
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Valid userid params in browser address with invalid issueId params redirects to 404 error page not found', (done) => {
        userid = '6216c50ff21fb2c08f1a8b9f';
        issueId = 'whateverthisthingis';
        chai
        .request(app)
        .get(`/user/${userid}/issue/${issueId}/update`)
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect; // to user dashboard with error message
            assert.equal(res.type, 'text/html');
            done();
        })
    })
})


suite(`HTTP REQUEST TO: '/user/:userid/issue/:issueId/delete'`, () => {
    let userid, issueId;

    test('Render file, status: 200, content-type: text/html', (done) => {
        userid = '6216c50ff21fb2c08f1a8b9f';
        issueId = '620e7f84709f599f96b3c7f3';
        chai
        .request(app)
        .get(`/user/${userid}/issue/${issueId}/delete`)
        .end((err, res) => {
            if (err) done(err)
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Invalid userid params in browser address with valid issueId params ', (done) => {
        userid = 'whateverthisthingis';
        issueId = '620e7f84709f599f96b3c7f3';
        chai
        .request(app)
        .get(`/user/${userid}/issue/${issueId}/delete`)
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect; // to login page with error message
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Valid userid params in browser address with invalid issueId params redirects to 404 error page not found', (done) => {
        userid = '6216c50ff21fb2c08f1a8b9f';
        issueId = 'whateverthisthingis';
        chai
        .request(app)
        .get(`/user/${userid}/issue/${issueId}/delete`)
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect; // to user dashboard with error message
            assert.equal(res.type, 'text/html');
            done();
        })
    })
})
