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

const agent = chai.request.agent(app);
let funct = new Funct();

suite('FUNCTIONAL TEST FOR POST REQUEST', () => {
    let input, output, expected;

    // suite('get Add User form', () => {

    //     test('function should get a form', () => {
    //         let req = {}, res = {};
    //         output = funct.add_user(req, res);
    //         let resStatus = 200;
    //         assert.strictEqual(res.status, resStatus, `res.status must be ${resStatus}`);
    //     })
    // })

    agent.get('/user/login').end((err, res) => {

        test('POST /user/login', (done) => {
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
        agent.post('/user/login')
            .set('CSRF-Token', _csrf)
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

        agent.close()
});
