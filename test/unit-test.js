const   chai = require('chai'),
        assert = chai.assert,
        ObjectId = require('mongodb').ObjectId,
        Funct = require('../controllers/functions.js');

let funct = new Funct();

suite('Unit Test', () => {
    let input, output, expected;

    suite('Mongo ID String Validation Unit Test', () => {

        test('function should accept strings of valid mongo ID', () => {

            input = '61fc67886b160cf621fba14d';
            output = funct.isValidId(input);
            expected = true;
            assert.strictEqual(output, expected, '');

            input = '551137c2f9e1fac808a5f572';
            output = funct.isValidId(input);
            expected = true;
            assert.strictEqual(output, expected, '');
        })

        test('function should reject strings of invalid mongo ID', () => {
            input = 'microsoft123';
            output = funct.isValidId(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = 'timtomtamted';
            output = funct.isValidId(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = '123456789012';
            output = funct.isValidId(input);
            expected = false;
            assert.strictEqual(output, expected, '');
        })
    })


    suite('Logical Name String Validation Unit Test', () => {

        test('function should reject strings of illogical name', () => {
            input = 'microsoft123';
            output = funct.isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = '           ';
            output = funct.isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = '2378#$%%^@!';
            output = funct.isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = '           ';
            output = funct.isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = 'X Æ A-12';
            output = funct.isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = '#$%$$&^%*^**%';
            output = funct.isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, '');

        })

        test('function should accept strings of logical name', () => {
            input = 'apples';
            output = funct.isValidName(input);
            expected = true;
            assert.strictEqual(output, expected, '');

            input = 'gremlins';
            output = funct.isValidName(input);
            expected = true;
            assert.strictEqual(output, expected, '');
        })
    })


    suite(`Unit Test for Function that Deletes All Properties in an Object
          that has an empty string as value, also delete _csrf property.`, () => {

        test('function should delete all properties in an object that has an empty string as its value', () => {
            input = { a: '', b: '', c: 'not empty', _csrf: 'string' };
            output = funct.getInput(input);
            outputArr = Object.entries(output);
            expected = { c: 'not empty' };
            expectedArr = Object.entries(expected);
            assert.typeOf(output, 'object', "Function's output must be a type of object.");
            assert.lengthOf(outputArr, expectedArr.length, `The length of this output must be ${expectedArr.length}.`);
            assert.strictEqual(outputArr[0][0], expectedArr[0][0], `The output object must have "${expectedArr[0][0]}" as a property.`);
            assert.strictEqual(outputArr[0][1], expectedArr[0][1], `The output object must have a property with "${expectedArr[0][1]} as a value.`);
            assert.strictEqual(output._csrf, undefined, 'There should be no property with a name _csrf in the output object.')
        })
    })


    suite(`Unit Test for Function that Convert an Object into a Valid Query String to Input as URI`, () => {

        test('function should convert key values in an object into a string of keys values with %20 separating between each key-value pair', () => {
            input = { firstKey: 'firstValue', secondKey: 'secondValue', thirdKey: 'thirdValue' };
            output = funct.stringify_obj_into_url_query_str(input);
            expected = 'firstKey:firstValue%20secondKey:secondValue%20thirdKey:thirdValue';
            assert.strictEqual(output, expected, '');
        })
    })


    suite('Unit Test for Function that Convert a String of Query into a Valid Object', () => {

        test('function should convert a string of key-value pairs where each key-value pair is separated from one another with %20, into an object', () => {
            input = 'firstKey:firstValue%20secondKey:secondValue%20thirdKey:thirdValue';
            output = funct.objectify_url_query_str(input);
            outputArr = Object.entries(output);
            expected = { firstKey: 'firstValue', secondKey: 'secondValue', thirdKey: 'thirdValue' };
            expectedArr = Object.entries(expected);
            assert.typeOf(output, 'object', "Functions output must be a type of object.");
            assert.lengthOf(outputArr, expectedArr.length, `The length of this output must be ${expectedArr.length}.`);
            assert.strictEqual(outputArr[0][0], expectedArr[0][0], `The output object must have "${expectedArr[0][0]}" as a property.`);
            assert.strictEqual(outputArr[0][1], expectedArr[0][1], `The output object must have a property with "${expectedArr[0][1]} as a value.`);
        })
    })


    suite(`Unit Test for a Function that Compare Two Objects and Returns an Array that consists of an Object that only -
          contains the properties that has been changed, the amount of properties that has been changed, the value of -
          .archived properties in the existing old object, also updates the properties in the old existing object -
          with reference to the values of properties in the new object argument.`, () => {

        test(`function should compare properties in an existing object and a new object, get only properties which have different value (except ._csrf), and -
        return an output of an array of 3 (three) elements, the amount of key-value pair at index 0 (zero), the result object at index 1 (one), and at index 2
        (two) is the boolean value of .archived property in the old object, if and only if new object has a property of status with a value of Archived, or Reopened. -
        Beside, the old object properties must have been updated too.`, () => {
            let old_obj = {
                _id: 'id',
                project: 'valid',
                issue_type: 'Bug',
                summary: 'summary',
                description: 'desc',
                priority: 'Low',
                reporter: 'repor',
                assignee: 'ass',
                status: 'open',
                inputter_id: 'a_string',
                archived: false,
            },
            old_value_description = old_obj.description,
            old_value_status = old_obj.status,
                new_obj = {
                project: 'valid',
                issue_type: 'Bug',
                summary: 'summary',
                description: 'changed no longer desc',
                priority: 'Low',
                reporter: 'repor',
                assignee: 'ass',
                status: 'In Progress',
                _csrf: 'csrf_string'
            }
            output = funct.getUpdate(old_obj, new_obj);
            outputArr = Object.entries(output[1]);
            expected = [ 2, { description: 'changed no loger desc', status: 'in progress' }, false ];
            expectedArr = Object.entries(expected[1]);
            assert.typeOf(output[0], 'number', "Index 0 (zero) in the function's array output must be a type of number.");
            assert.typeOf(output[1], 'object', "Index 1 (one) in the function's array output must be a type of object.");
            assert.lengthOf(outputArr, expectedArr.length, `The length of this output must be ${expectedArr.length}.`);
            assert.strictEqual(output[0], expectedArr.length, `The count number at index 0 (zero) must equal to ${expectedArr.length}.`);
            assert.strictEqual(output[1].description, new_obj.description, `The output array at index 1 (one) and the new object must have the exact same property "${"description"}, with the exact same value`);
            assert.strictEqual(output[1].description, old_obj.description, `Old object properties must be updated with newest value.`)
            assert.notStrictEqual(output[1].description, old_value_description, `The output array at index 1 (one) and the old object must have the exact same property "${"description"}, but different value.`);
            assert.strictEqual(output[1].status, new_obj.status, `The output array at index 1 (one) and the new object must have the exact same property "${"status"}, with the exact same value`);
            assert.strictEqual(output[1].status, old_obj.status, `Old object properties must be updated with newest value.`)
            assert.notStrictEqual(output[1].status, old_value_status, `The output array at index 1 (one) and the old object must have the exact same property "${"status"}, but different value.`);
            assert.strictEqual(output[1].project, undefined, `The output array at index 1 (one) must be undefined`)
            assert.strictEqual(output[2], undefined, 'The output array at index 2 (two) must be undefined')
            assert.strictEqual(output._csrf, undefined, 'There should be no property with a name _csrf in the output object.')
        })

        test(`Any property in the new object with a value of an empty string should be omitted from the object stored in the output array at index 1 (one). When new object has a property .status with a value of
        "Archived", then the old object .status must be updated to mirror that. Beside, that .status must also be included in the output object stored in the result array. The .archived property in the old -
        object must have been updated accordingly, and its value is reflected in index 2 (two) of the output array.`, () => {
            let old_obj = {
                reporter: 'repor',
                description: 'Desc',
                status: 'Open',
                archived: false,
            },
                new_obj = {
                reporter: '',
                description: 'desc',
                status: 'Archived',
                _csrf: 'csrf_string'
            }
            output = funct.getUpdate(old_obj, new_obj);
            expected = [ 2, { description: 'changed no loger desc', status: 'Archived' }, true ];
            assert.strictEqual(expected[1].status, new_obj.status, 'Object in the output array at index 1 (one) must have a property of .status with value the same with value stored in the property .status in new object.');
            assert.strictEqual(expected[1].reporter, undefined, 'Object in the output array at index 1 (one) must not have a property of .reporter, because the value of that property in the new object is actually an empty string.')
            assert.strictEqual(old_obj.archived, expected[2], 'The output archived value must be true.')
            assert.strictEqual(output[2], true, 'The output array at index 2 (two) must have a value of boolean: true, which reflects the value of .archived property in the old object.');
            assert.strictEqual(old_obj.archived, true, 'The value of .archived property in the old object must have been updated because new .status property value is "Archived".');
        })

        test(`When new object has a property .status with a value of 'Reopened', the same property in the old object must be updated accordingly. Beside, .archived property in the old object must be updated to have a value of false.
        That same property must also be included in the output object stored at index 2 (two) of the output array, and index 2 (two) of the output array must reflect the value of .archived in the old object.`, () => {
            let old_obj = {
                status: 'Archived',
                archived: true,
            },
                new_obj = {
                status: 'Reopened',
                _csrf: 'csrf_string'
            }
            output = funct.getUpdate(old_obj, new_obj);
            expected = [ 1, { status: 'Reopened' }, false ];
            assert.strictEqual(expected[1].status, new_obj.status, 'Object in the output array at index 1 (one) must have a property of .status with value the same with value stored in the property .status in new object.');
            assert.strictEqual(old_obj.archived, expected[2], 'The output archived value must be false');
            assert.strictEqual(old_obj.archived, false, 'The value of .archived property in the old object must have been updated because new .status property value is "Reopened".');
            assert.strictEqual(output[2], false, 'The output array at index 2 (two) must have a value of boolean: false, which reflects the value of updated .archived property in the old object.');

        })
    })
});
