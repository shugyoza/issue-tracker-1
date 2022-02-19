// import for check mongoId validity
const ObjectId = require('mongodb').ObjectId;

function Funct() {

    this.functionName = function(input) {
        return true;
    }
    // function to check if a string is a valid mongo ID
    this.isValidId = (id_string) => {
        if(ObjectId.isValid(id_string)) {
            if ((String)(new ObjectId(id_string)) === id_string) return true;
            return false;
        }
        return false;
    }
    // function to check if a string of name can be considered valid
    this.isValidName = (name_string) => {
        const regex = /^(?![\s.]+$)[a-zA-Z\s.]*$/;
        const matched = name_string.match(regex);
        if (!matched) return false;
        return true;
    }
    // function to get only fields with truthy value, and delete all other keys that has empty string '' as a value
    this.getInput = (reqBody) => {
        for (let key in reqBody) {
            if (!reqBody[key].length) delete reqBody[key];
        }
        return reqBody;
    }
    // function to convert an object into a string or req.query
    this.stringify_obj_into_url_query_str = (obj) => {
        let result = '';
        for (let key in obj) {
            if (key === '_csrf') continue;
            else result += `${key}:${obj[key]}%20`;
        }
        result = result.slice(0, result.length - 3)
        return result;
    }
    // function to convert a string of req.query into an object
    this.objectify_url_query_str = (str) => {
        const   arr_of_keyVal = str.split('%20'),
                resObj = {};
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
    this.getUpdate = (current_obj, new_obj) => {
        let count = 0,
            update = {},
            archived;
        for (let key in new_obj) {
            if (key === '_csrf') continue;
            if (key === 'status') {
                if (new_obj[key] === 'Archived') {
                    archived = update.archived = current_obj.archived = true;
                } else if (new_obj[key] === 'Reopened') {
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


}

module.exports = Funct;
