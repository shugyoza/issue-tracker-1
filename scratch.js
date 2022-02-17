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
