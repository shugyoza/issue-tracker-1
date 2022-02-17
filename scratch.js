const convert_doc_into_string = (docObj) => {
    let result = true;
}

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
