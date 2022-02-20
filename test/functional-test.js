const   chai = require('chai'),
        assert = chai.assert,
        expect = chai.expect;

const   app = require('../app'),
        User = require('../db/models/user'),
        Issue = require('../db/models/issue'),
        Funct = require('../controllers/functions.js');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

suite('Functional Tests', () => {
    let _id;

    test('GET / should redirect to /user/login, which after rendering /user/login should result in status 200.', (done) => {
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

    test('POST /user/login', (done) => {
        chai
            .request(app)
            .post('/user/login')
            .send({
                email: 'johnsnow@email.com',
                password: 'Password123'
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.redirect;
                assert.equal(res.status, 200);
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

    test('GET /user/notAValidMongoIdString', (done) => {
        chai
            .request(app)
            .get('/user/notAValidMongoIdString')
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.redirect;
                done();
            })
    })

    test('GET /user/:userid', (done) => {
        chai
            .request(app)
            .get(`/user/${user._id}`)
            .end((err, res) => {
                if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                assert.isNotEmpty(res.body._id);
                done();
            })
    })

    test('POST to /user/add with all fields: first_name, last_name, email, and password, filled in', (done) => {
        chai
            .request(app)
            .post('/user/add')
            .type('form')
            .send({
                first_name: 'John',
                last_name: 'Wick',
                email: 'johnwick@email.com',
                password: `Password123`
            })
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.redirect;
                assert.equal(res.status, 200);
                done();
            })
    })
})


/*
// npm install mocha
describe('User', () => {
    describe('Create User', () => {
        if('Returns a 200 response', () => {
            return chai.request(app)
                .post('/user/add')
                .send({
                    first_name: 'John',
                    last_name: 'Wick',
                    email: 'johnwick@email.com',
                    password: `Password123`
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    done();
                })
        });
    });
});
*/
