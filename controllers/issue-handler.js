// import for check mongoId validity
const ObjectId = require('mongodb').ObjectId;

function IssueHandler() {

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
}

module.exports = IssueHandler;
