const   chai = require('chai'),
        assert = chai.assert,
        expect = chai.expect;

const app = require('../app')
    , User = require('../db/models/user')
    , {queryDoc} = require('../controllers/utils');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

let idToDelete = '621974c9cbd8ffafa70867c9';

suite(`HTTP REQUEST TO: '/'`, () => {

    test('Redirect to /user/login, status: 200, content-type: text/html', (done) => {
        chai
        .request(app)
        .get('/')
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect;
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })
})

suite(`HTTP REQUEST TO: '/user/super'`, () => {

    test('Render file, status: 200, content-type: text/html', (done) => {
        chai
        .request(app)
        .get('/user/super')
        .end((err, res) => {
            if (err) done(err)
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Return result: a list of users', (done) => {
        chai
        .request(app)
        .get('/test/user/super')
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.isArray(res.body, 'A list of users represented in an array')
            done();
        })
    })
})


suite(`HTTP REQUEST TO: '/user/login'`, () => {

    test('Render file, status: 200, content-type: text/html', (done) => {
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

    test('Valid email and password input must return the user document, which _id will be used for redirect to profile page "user/:userid', (done) => {
        chai
        .request(app)
        .post('/test/user/login')
        .send({
            email: 'testingroute@email.com',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.email, 'testingroute@email.com');
            assert.equal(res.body.password, 'Password123');
            done();
        })
    })

    test('Valid email input with invalid password input must return an error, status: 400, and redirect to login page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/login')
        .send({
            email: 'testingroute@email.com',
            password: 'NOTPassword123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.email, 'testingroute@email.com');
            assert.equal(res.body.password, 'NOTPassword123');
            assert.isNotEmpty(res.error)
            done();
        })
    })

    test('Email input that is not registered in database must return an error, status: 400, and redirect to register page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/login')
        .send({
            email: 'qwertyuiopasdfghjklzxcvbnm@qwertyuiopasdfghjklzxcvbnm.blah',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.email, 'qwertyuiopasdfghjklzxcvbnm@qwertyuiopasdfghjklzxcvbnm.blah');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error)
            done();
        })
    })

    test('Blank email input must return an error, status: 400, and redirect to register page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/login')
        .send({
            email: 'testingroute@email.com',
            password: ''
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.email, 'testingroute@email.com');
            assert.equal(res.body.password, '');
            assert.isNotEmpty(res.error)
            done();
        })
    })

    test('Valid email input with blank password input must return an error, status: 400, and redirect to register page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/login')
        .send({
            email: '',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.email, '');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error)
            done();
        })
    })

    test('Blank email input and blank password input must return an error, status: 400, and redirect to register page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/login')
        .send({
            email: '',
            password: ''
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.email, '');
            assert.equal(res.body.password, '');
            assert.isNotEmpty(res.error);
            done();
        })
    })
})


suite(`HTTP REQUEST TO: '/user/add'`, () => {

    test('Render file, status: 200, content-type: text/html', (done) => {
        chai
        .request(app)
        .get('/user/add')
        .end((err, res) => {
            if (err) done(err)
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Blank first_name input with everything else filled must return an error, status: 400, and redirect to register page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/add')
        .send({
            first_name: '',
            last_name: 'LastName',
            email: 'firstNamelastName@email.com',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.first_name, '');
            assert.equal(res.body.last_name, 'LastName');
            assert.equal(res.body.email, 'firstNamelastName@email.com');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error)
            done();
        })
    })

    test('Blank last_name input with everything else filled must return an error, status: 400, and redirect to register page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/add')
        .send({
            first_name: 'firstName',
            last_name: '',
            email: 'firstNamelastName@email.com',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.first_name, 'firstName');
            assert.equal(res.body.last_name, '');
            assert.equal(res.body.email, 'firstNamelastName@email.com');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error)
            done();
        })
    })

    test('Blank email input with everything else filled must return an error, status: 400, and redirect to register page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/add')
        .send({
            first_name: 'FirstName',
            last_name: 'LastName',
            email: '',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.first_name, 'FirstName');
            assert.equal(res.body.last_name, 'LastName');
            assert.equal(res.body.email, '');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error)
            done();
        })
    })

    test('Blank password input with everything else filled must return an error, status: 400, and redirect to register page with error message', (done) => {
        chai
        .request(app)
        .post('/test/user/add')
        .send({
            first_name: 'FirstName',
            last_name: 'LastName',
            email: '',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.first_name, 'FirstName');
            assert.equal(res.body.last_name, 'LastName');
            assert.equal(res.body.email, '');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error);
            done();
        })
    })

    test('When an email address input has been in the database, and user being redirected to login page, an error message must be displayed in the login page that email has been in database', (done) => {
        chai
        .request(app)
        .post('/test/user/add')
        .send({
            first_name: 'FirstName',
            last_name: 'LastName',
            email: 'testingroute@email.com',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.isNotEmpty(res.body.error);
            assert.equal(res.body.status, 302);
            assert.equal(res.body.redirect, '/test/user/login?registered=true');
            assert.isNotEmpty(res.error);
            done();
        })
    })

    test('Valid first_name, last_name, email and password input must return the user document, which _id will be used for redirect to profile page "/user/:userid', (done) => {
        let newUser = {
            _id: `${idToDelete}`,
            first_name: 'firstName',
            last_name: 'lastName',
            email: 'firstNamelastName@email.com',
            password: 'Password123'
        }
        chai
        .request(app)
        .post('/test/user/add')
        .send(newUser)
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.status, 302);
            assert.include(res.body.redirect, '/test/user/');
            assert.isNotNull(res.body.user);
            assert.equal(res.body.user.first_name, newUser.first_name);
            assert.equal(res.body.user.last_name, newUser.last_name);
            assert.equal(res.body.user.email, newUser.email);
            done();
        })
    })

})


suite(`HTTP REQUEST TO: '/user/:userid'`, () => {

    test('Invalid :userid redirect to "/user/login?bool=false" page, status: 400, content-type: text/html', (done) => {
        chai
        .request(app)
        .get('/user/notAValidMongoIdString')
        .end((err, res) => {
            if (err) done(err)
            assert.equal(res.status, 400);
            expect(res).to.redirect; // to login page
            done();
        })
    })

    test('Valid :userid render the file, status: 200, content-type: text-html. This path is to handle redirect from successfull login', (done) => {
        let id = '6216814c52221db2b03dd220';
        chai
        .request(app)
        .get(`/user/${id}`)
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })
})


suite(`HTTP REQUEST TO: '/user/:userid/edit'`, () => {

    test('Valid :userid render the form file, status: 200, content-type: text-html', (done) => {
        let id = '6216c50ff21fb2c08f1a8b9f';
        chai
        .request(app)
        .get(`/user/${id}/edit`)
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    test('Submitting an edit form with all field emptied will redirect to edit page, with all field prefilled with existing database value, status: 400', (done) => {
        let id = '6216c50ff21fb2c08f1a8b9f';

        chai
        .request(app)
        .post(`/test/user/${id}/edit`)
        .send({
            first_name: '',
            last_name: '',
            email: '',
            password: ''
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.first_name, 'DoNotEdit');
            assert.equal(res.body.last_name, 'TestingEditRoute');
            assert.equal(res.body.email, 'DoNotEditTestingEditRoute@email.com');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error);
            done();
        })
    })

    test('Submitting an edit form with at least one field input will redirect to edit page, status: 400, with error message', (done) => {
        let id = '6216c50ff21fb2c08f1a8b9f';
        chai
        .request(app)
        .post(`/test/user/${id}/edit`)
        .send({
            first_name: '',
            last_name: 'TestingEditRoute',
            email: 'DoNotEditTestingEditRoute@email.com',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.first_name, 'DoNotEdit');
            assert.equal(res.body.last_name, 'TestingEditRoute');
            assert.equal(res.body.email, 'DoNotEditTestingEditRoute@email.com');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error);
            done();
        })
    })

    test('Submitting an edit form without any field input will redirect to edit page, status: 400, with error message', (done) => {
        let id = '6216c50ff21fb2c08f1a8b9f';
        chai
        .request(app)
        .post(`/test/user/${id}/edit`)
        .send({
            first_name: 'DoNotEdit',
            last_name: '',
            email: 'DoNotEditTestingEditRoute@email.com',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 400);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.first_name, 'DoNotEdit');
            assert.equal(res.body.last_name, 'TestingEditRoute');
            assert.equal(res.body.email, 'DoNotEditTestingEditRoute@email.com');
            assert.equal(res.body.password, 'Password123');
            assert.isNotEmpty(res.error);
            done();
        })
    })

    test('Submitting an edit form with all field input filled in and passed validation successfully update the document in the database', (done) => {
        let id = '6216c50ff21fb2c08f1a8b9f';
        chai
        .request(app)
        .post(`/test/user/${id}/edit`)
        .send({
            first_name: 'DoNotEdit',
            last_name: 'TestingEditRoute',
            email: 'DoNotEditTestingEditRoute@email.com',
            password: 'changedPassword1234'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.code, 302);
            assert.equal(res.body.redirect, `/user/${id}`)
            assert.equal(res.body.first_name, 'DoNotEdit');
            assert.equal(res.body.last_name, 'TestingEditRoute');
            assert.equal(res.body.email, 'DoNotEditTestingEditRoute@email.com');
            assert.equal(res.body.password, 'changedPassword1234');
            done();
        })
    })

    test('- reset document content -', (done) => {
        let id = '6216c50ff21fb2c08f1a8b9f';
        chai
        .request(app)
        .post(`/test/user/${id}/edit`)
        .send({
            first_name: 'DoNotEdit',
            last_name: 'TestingEditRoute',
            email: 'DoNotEditTestingEditRoute@email.com',
            password: 'Password123'
        })
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.first_name, 'DoNotEdit');
            assert.equal(res.body.last_name, 'TestingEditRoute');
            assert.equal(res.body.email, 'DoNotEditTestingEditRoute@email.com');
            assert.equal(res.body.password, 'Password123');
            done();
        })
    })
})


suite(`HTTP REQUEST TO: '/user/:userid/delete'`, () => {

    test('Valid :userid render the form file, status: 200, content-type: text-html', (done) => {
        let id = '6216c50ff21fb2c08f1a8b9f';
        chai
        .request(app)
        .get(`/user/${id}/delete`)
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'text/html');
            done();
        })
    })

    /* DOES NOT WORK TO DELETE DOCUMENT
    User.find({ email: 'firstNamelastName@email.com' }).then(res => {
        let id = res._id;

        test('Successful delete on valid :userid redirect to login page', (done) => {
            chai
            .request(app)
            .post(`/test/user/${id}/delete`)
            .end((err, res) => {
                if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body._id, idToDelete);
                assert.equal(res.body.code, 302);
                assert.equal(res.body.redirect, '/test/user/login')
                done();
            })
        })
    }) */

/* TO DO
    test('Successful delete on valid :userid redirect to login page', (done) => {
        chai
        .request(app)
        .post(`/test/user/${idToDelete}/delete`)
        .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body._id, idToDelete);
            assert.equal(res.body.code, 302);
            assert.equal(res.body.redirect, '/test/user/login')
            done();
        })
    })

    test('Successful delete on valid :userId deleted the document from database', (done) => {
        chai
        .request(app)
        .get(`/user/${idToDelete}/delete`)
        .send()
        .end((err, res) => {
            if (err) done(err);
            expect(res).to.redirect
            assert.equal(res.status, 200);
            assert.equal(idToDelete, undefined);
            done();
        })
    }) */

})
