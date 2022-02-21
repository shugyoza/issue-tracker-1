const   chai = require('chai'),
        assert = chai.assert,
        expect = chai.expect;
        csrf = require('csurf'),
        csrfProtection = csrf({ cookie: true });

const   app = require('../app'),
        User = require('../db/models/user'),
        Issue = require('../db/models/issue'),
        Funct = require('../controllers/functions.js');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const   agent = chai.request.agent(app),
        funct =

suite('FUNCTIONAL TEST FOR GET REQUEST', () => {
    let _id, csrfToken;

    test('GET request to root: /', (done) => {
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

    test('GET request to /user/login', (done) => {
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

    test('GET request to /user/super', (done) => {
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
            .get(`/user/${ '61fc67886b160cf621fba14d' }`) // temporary hard-code
            .end((err, res) => {
                if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'text/html');
                // assert.equal(res.body.first_name, 'Jay');
                // assert.equal(res.body.last_name, 'Spence');
                // assert.equal(res.body.email, 'jayspence@email.com')
                done();
            })
    })
