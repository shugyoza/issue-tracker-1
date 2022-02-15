// import for check mongoId validity
const ObjectId = require('mongodb').ObjectId;

function Funct() {

    this.functionName = function(input) {
        return true;
    }
    this.isValidMongoId = (id_string) => {
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
}

module.exports = Funct;
