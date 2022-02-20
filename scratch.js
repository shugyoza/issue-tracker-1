const convert_doc_into_string = (docObj) => {
    let result = true;
}


const validate = (doc_to_validate = {}, validator = {}) => {
    for (let key in doc_to_validate) {
        if (validator.hasOwnProperty(key)) {
            validator_obj[key](doc_obj_to_validate)
        }
    }
}

// 20220217
// const getKey = (keyVal_str) => {
//     let keyStr = '';
//     for (let i = 0; i < keyVal_str.length; i++) {
//         let char = keyVal_str[i];
//         if (char === ':') return keyStr;
//         keyStr += char;
//     }
// }

// 20220217
// const getKey = (keyVal_str) => {
//     return keyVal_str.slice(0, keyVal_str.indexOf(':'))
// }

// 20220217
// const getValue = (keyVal_str) => {
//     let keyStr = '';
//     for (let i = keyVal_str.length - 1; i >= 0; i--) {
//         let char = keyVal_str[i];
//         if (char === ':') return keyStr;
//         keyStr = char + keyStr;
//     }
// }

// 20220217
// const getValue = (keyVal_str) => {
//     return keyVal_str.slice(keyVal_str.indexOf(':') + 1)
// }

// let obStr = '_id:id'
// console.log(getKey(obStr))
// console.log(getValue(obStr))

// 20220217
// const objectify_url_query_str = (str) => {
//     const   arr_of_keyVal = str.split('%20'),
//             resObj = {};
//     for (let i = 0; i < arr_of_keyVal.length; i++) {
//         let strEl = arr_of_keyVal[i],
//             idx = strEl.indexOf(':'),
//             keyStr = strEl.slice(0, idx),
//             valStr = strEl.slice(idx + 1);
//         resObj[keyStr] = valStr;
//     }
//     return resObj;
// }

// let str = '_id:id%20project:valid%20issue_type:type%20summary:summary%20description:desc%20priority:prio%20reporter:repor%20assignee:ass%20status:open'
// console.log(objectify_url_query_str(str))


/* 20220217 DONE
const stringify_obj_into_url_query_str = (obj) => {
    let result = '';
    for (let key in obj) {
        result += `${key}:${obj[key]}%20`;
    }
    result = result.slice(0, result.length - 3)
    return result;
}

let obj = {
    _id: 'id',
    project: 'valid',
    issue_type: 'type',
    summary: 'summary',
    description: 'desc',
    priority: 'prio',
    reporter: 'repor',
    assignee: 'ass',
    status: 'open'
}
stringify_object(obj)
*/

/* 20220216. DONE
const getUpdatedField = (reqBody) => {
    for (let key in reqBody) {
        if (!reqBody[key].length) delete reqBody[key];
    }
    return reqBody;
}

let obj = {
    _id: '',
    project: 'valid',
    issue_type: '',
    summary: '',
    description: '',
    priority: '',
    reporter: '',
    assignee: '',
    status: ''
}

let result = getUpdatedField(obj);
console.log(result)
*/

const getInput = (reqBody) => {
    for (let key in reqBody) {
        if (reqBody[key] === '' || key === '_csrf') delete reqBody[key];
    }
    return reqBody;
}
    let obj = {
        _csrf: 'string',
        _id: 'id',
        project: '',
        issue_type: '',
        summary: 'summary',
        description: 'desc',
        priority: 'prio',
        reporter: 'repor',
        assignee: 'ass',
        status: 'open'
    }
    console.log(getInput(obj))
