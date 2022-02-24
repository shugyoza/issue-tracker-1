const getCSRF = (res_header) => {
    let setCookie = '', result = '';
    for (let key in res_header) {
        if (key === 'set-cookie') {
            setCookie = res_header[key][0];
            break;
        }
    }
    result = setCookie.slice(setCookie.indexOf('=') + 1, setCookie.indexOf(';'));
    return result;
}

module.exports = { getCSRF };

// let setCookie = '';
// for (let key in res.header) {
//     if (key === 'set-cookie') {
//         setCookie = res.header[key][0];
//         break;
//     }
// }
// csrf = setCookie.slice(setCookie.indexOf('=') + 1, setCookie.indexOf(';'));
// console.log(csrf, setCookie)
