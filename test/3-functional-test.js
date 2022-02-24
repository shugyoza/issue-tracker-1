const   chai = require('chai'),
        assert = chai.assert,
        expect = chai.expect;
        csrf = require('csurf'),
        csrfProtection = csrf({ cookie: true });

const app = require('../app')
    , { getCSRF } = require('./utils');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const agent = chai.request.agent(app);

/*
suite('FUNCTIONAL TEST FOR POST ADD USER REQUEST', () => {
    let input, output, expected, csrf;
})

suite('FUNCTIONAL TEST FOR POST REQUEST', () => {
    let input, output, expected;

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
}); */

// suite('FUNCTIONAL TEST FOR POST REQUEST', () => {
//     let input, output, expected;

//     agent.get('/user/add').end((err, res) => {

//         test('POST /user/add', (done) => {
//             chai
//                 .request(app)
//                 .get('/user/add')
//                 .end((err, res) => {
//                     if (err) done(err)
//                     assert.equal(res.status, 200);
//                     assert.equal(res.type, 'text/html');
//                     done();
//                 })
//         })

//         agent.post('/user/login')
//             .set('CSRF-Token', _csrf)
//             .send({
//                 email: 'johnsnow@email.com',
//                 password: 'Password123'
//             })
//             .end((err, res) => {
//                 if (err) done(err);
//                 expect(res).to.redirect;
//                 assert.equal(res.status, 200);
//                 done();
//             })
//         })

//         agent.close()
// });
