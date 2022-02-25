// import for check mongoId validity
const ObjectId = require('mongodb').ObjectId
    , csrf = require('csurf')
    , csrfProtection = csrf({ cookie: true });

// simple middleware function for handling exceptions inside async express routes and pass them to error hndlers
const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

// function to check if a string is a valid mongo ID
const isValidId = (id_string) => {
    if(ObjectId.isValid(id_string)) {
        if ((String)(new ObjectId(id_string)) === id_string) return true;
        return false;
    }
    return false;
}

// function to check if a string of name can be considered valid
const isValidName = (name_string) => {
    const regex = /^(?![\s.]+$)[a-zA-Z\s.]*$/;
    const matched = name_string.match(regex);
    if (!matched) return false;
    return true;
}

// function to get only fields with truthy value, and delete all other keys that has empty string '' as a value
const getInput = (reqBody) => {
    for (let key in reqBody) {
        if (reqBody[key] === '' || key === '_csrf') delete reqBody[key];
    }
    return reqBody;
}

// function to convert an object into a string or req.query
const stringify_obj_into_url_query_str = (obj) => {
    let result = '';
    for (let key in obj) {
        if (key === '_csrf') continue;
        else result += `${key}:${obj[key]}%20`;
    }
    result = result.slice(0, result.length - 3)
    return result;
}

// function to convert a string of req.query into an object
const objectify_url_query_str = (str) => {
    const arr_of_keyVal = str.split('%20')
        , resObj = {};
    for (let i = 0; i < arr_of_keyVal.length; i++) {
        let strEl = arr_of_keyVal[i],
            idx = strEl.indexOf(':'),
            keyStr = strEl.slice(0, idx),
            valStr = strEl.slice(idx + 1);
        resObj[keyStr] = valStr;
    }
    return resObj;
}

// function to extract only property(ies) that user has changed
const update = (current_obj, new_obj) => {
    let count = 0, update = {}, archived;
    for (let key in new_obj) {
        if (key === '_csrf') continue;
        if (key.toLowerCase() === 'status') {
            if (new_obj[key].toLowerCase() === 'archived') {
                archived = update.archived = current_obj.archived = true;
            } else if (new_obj[key].toLowerCase() === 'reopened') {
                archived = update.archived = current_obj.archived = false;
            }
        }
        if (new_obj[key] !== '' > 0 && current_obj[key] !== new_obj[key]) {
            update[key] = new_obj[key];
            count++;
            current_obj[key] = new_obj[key];
        }
    }
    return [count, update, archived];
}

// function to console.log session and cookie
const logSession = (req, res, next) => {
    console.log(req.session);
    console.log( { 'req.user': req.user } );
    return next();
}

module.exports = {
    asyncHandler,
    csrfProtection,
    isValidId,
    isValidName,
    getInput,
    stringify_obj_into_url_query_str,
    objectify_url_query_str,
    update,
    logSession
}
