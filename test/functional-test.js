const   chai = require('chai'),
        assert = chai.assert;

const   app = require('../app'),
        User = require('../db/models/user'),
        Issue = require('../db/models/issue');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

suite('Functional Tests', () => {

    test('GET / should redirect to /user/login, which after rendering /user/login should result in status 200.', (done) => {
        chai
            .request(app)
            .get('/')
            .end((err, res) => {
                if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                done();
            })
    })

    test('GET /user/login', (done) => {
        chai
            .request(app)
            .get('/user/login')
            .end((err, res) => {
                if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                done();
            })
    })

    test('GET /user/super', (done) => {
        chai
            .request(app)
            .get('/user/super')
            .end((err, res) => {
                if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                done();
            })
    })

    test('GET /user/add', (done) => {
        chai
            .request(app)
            .get('/user/add')
            .end((err, res) => {
                if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                done();
            })
    })

    test('POST to /user/add with all fields: first_name, last_name, email, and password, filled in', (done) => {
        chai
            .request(app)
            .post('/user/add')
            .send({
                'first_name': 'John',
                'last_name': 'Wick',
                'email': 'johnwick@email.com',
                'password': `Password123`
            })
            .end((err, res) => {
                if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                assert.isNotEmpty(res.body._id)
                assert.equal(res.body.first_name, 'John');
                assert.equal(res.body.last_name, 'Wick');
                assert.equal(res.body.email, 'johnwick@email.com');
                assert.equal(res.body.password, 'Password123');
                done();
            })
    })
})
