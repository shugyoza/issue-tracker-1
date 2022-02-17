// import for check mongoId validity
const ObjectId = require('mongodb').ObjectId;

function Funct() {

    this.functionName = function(input) {
        return true;
    }
    this.isValidId = (id_string) => {
        if(ObjectId.isValid(id_string)) {
            if ((String)(new ObjectId(id_string)) === id_string) return true;
            return false;
        }
        return false;
    }
    this.isValidName = (name_string) => {
        const regex = /^(?![\s.]+$)[a-zA-Z\s.]*$/;
        const matched = name_string.match(regex);
        if (!matched) return false;
        return true;
    }
    // function to get only fields with truthy value, and delete all other keys that has empty string '' as a value
    this.getUpdate = (reqBody) => {
        for (let key in reqBody) {
            if (!reqBody[key].length) delete reqBody[key];
        }
        return reqBody;
    }}

module.exports = Funct;
