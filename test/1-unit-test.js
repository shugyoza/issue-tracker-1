const   chai = require('chai'),
        { assert, expect } = chai,
        ObjectId = require('mongodb').ObjectId,
        {
            asyncHandler,
            csrfProtection,
            isValidId,
            isValidName,
            getInput,
            stringify_obj_into_url_query_str,
            objectify_url_query_str,
            update,
            logSession,
            ensureAuthenticated,
            checkPermission,
            add_user
        } = require('../controllers/utils.js');

suite('UNIT TEST', () => {
    let input, output, expected;

    suite('Mongo ID String Validation', () => {

        test('Only valid Mongo ID strings should be accepted.', () => {

            input = '61fc67886b160cf621fba14d';
            output = isValidId(input);
            expected = true;
            assert.strictEqual(output, expected, '');

            input = '551137c2f9e1fac808a5f572';
            output = isValidId(input);
            expected = true;
            assert.strictEqual(output, expected, '');
        })

        test('Invalid Mongo ID strings should be rejected.', () => {
            input = 'microsoft123';
            output = isValidId(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = 'timtomtamted';
            output = isValidId(input);
            expected = false;
            assert.strictEqual(output, expected, '');

            input = '123456789012';
            output = isValidId(input);
            expected = false;
            assert.strictEqual(output, expected, '');
        })
    })


    suite('Logical Name String Validation', () => {

        test('Reject improbable name strings.', () => {
            input = 'microsoft123';
            output = isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, 'Strings containing numeric character should be rejected.');

            input = '           ';
            output = isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, 'Strings of only white space should be rejected.');

            input = '2378#$%%^@!';
            output = isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, 'Strings containing symbols and numeric character should be rejected.');

            input = 'X Æ A-12';
            output = isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, 'Strings containing non arabic alphabets, symbols, and numeric characters should be rejected ');

            input = '#$%$$&^%*^**%';
            output = isValidName(input);
            expected = false;
            assert.strictEqual(output, expected, 'Strings containing all symbols should be rejected.');

        })

        test('Accept probable and logical name strings.', () => {
            input = 'apples';
            output = isValidName(input);
            expected = true;
            assert.strictEqual(output, expected, '');

            input = 'gremlins';
            output = isValidName(input);
            expected = true;
            assert.strictEqual(output, expected, '');
        })
    })


    suite(`Clean-up Unwanted Key-Value Pairs from an Object.`, () => {

        test('A key named _csrf, and all keys with empty string as a value must be deleted from an object', () => {
            input = { a: '', b: '', c: 'not empty', _csrf: 'string' };
            output = getInput(input);
            outputArr = Object.entries(output);
            expected = { c: 'not empty' };
            expectedArr = Object.entries(expected);
            assert.typeOf(output, 'object', "Function's output must be a type of object.");
            assert.lengthOf(outputArr, expectedArr.length, `Output object's length must be: ${expectedArr.length}.`);
            assert.strictEqual(outputArr[0][0], expectedArr[0][0], `Output object must have a key named: "${expectedArr[0][0]}".`);
            assert.strictEqual(outputArr[0][1], expectedArr[0][1], `The key named: "${expectedArr[0][0]}" in output object must have a value: "${expectedArr[0][1]}.`);
            assert.strictEqual(output._csrf, undefined, 'Output object must not have a key named "_csrf".')
        })
    })


    suite(`Convert an Object into a Valid URL Query String.`, () => {

        test('Output string for { aKey: "aValue", bKey: "bValue"} should be: "aKey:aValue%20bKey:bValue". %20 separates every key-value pair.', () => {
            input = { firstKey: 'firstValue', secondKey: 'secondValue', thirdKey: 'thirdValue' };
            output = stringify_obj_into_url_query_str(input);
            expected = 'firstKey:firstValue%20secondKey:secondValue%20thirdKey:thirdValue';
            assert.strictEqual(output, expected, '');
        })
    })


    suite('Convert a Valid URL Query String into an Object', () => {

        test('With input string: "aKey:aValue%20bKey:bValue", the output object must be: { aKey: "aValue", bKey: "bValue"}.', () => {
            input = 'firstKey:firstValue%20secondKey:secondValue%20thirdKey:thirdValue';
            output = objectify_url_query_str(input);
            outputArr = Object.entries(output);
            expected = { firstKey: 'firstValue', secondKey: 'secondValue', thirdKey: 'thirdValue' };
            expectedArr = Object.entries(expected);
            assert.typeOf(output, 'object', "Output must be an object.");
            assert.lengthOf(outputArr, expectedArr.length, `The amount of key-value pairs in the output must be: ${expectedArr.length}.`);
            assert.strictEqual(outputArr[0][0], expectedArr[0][0], `Output object must have a key: "${expectedArr[0][0]}".`);
            assert.strictEqual(outputArr[0][1], expectedArr[0][1], `Value of key: "${expectedArr[0][0]}" in the output object must be: "${expectedArr[0][1]}.`);
        })
    })


    suite(`Compare ObjectA (in Database) and ObjectB (request body). Update ObjectA According to ObjectB. Return an Array for Result of the Update`, () => {

        test(`- Output array must look like this: [ 2, { aKey: 'aVal', bKey: 'bVal'}, true ].
        - Index zero is the amount of key-value pairs within the object at index one.
        - Object at index one only contains keys that ObjectA and ObjectB both have, but differ in their values.
        - All keys in ObjectA eventually must be updated to with reference to ObjectB.
        - Boolean at index two reflect the value of key .archived that ObjectA has.`, () => {

            let objectA = {
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
            objectA_description = objectA.description,
            objectA_status = objectA.status,
                objectB = {
                project: 'valid',
                issue_type: 'Bug',
                summary: 'summary',
                description: 'changed no longer desc',
                priority: 'Low',
                reporter: 'repor',
                assignee: 'ass',
                status: 'In Progress',
                _csrf: 'csrf_string'
            };

            output = update(objectA, objectB); // must be a [2, {}, true/false]
            expected = [ 2, { description: 'changed no loger desc', status: 'in progress' }, false ];

            assert.strictEqual( output[0], expected[0], 'Output array at index zero must equal to expected array at index zero');
            assert.strictEqual( output[0], Object.entries(output[1]).length, 'Output array at index zero must equal to the amount of key-value pairs within the object at index one.');
            assert.strictEqual( Object.entries(output[1]).length, Object.entries(expected[1]).length, 'The amount of key-value pairs in the output object should equal the expected object.');
            assert.typeOf(output[1], 'object', "Output array at index one must be an object.");
            assert.strictEqual(output[2], undefined, 'The output array at index 2 (two) must be undefined, because objectB.status is not: Archived or Reopened.');

            expect(output[1]).to.have.all.keys('description', 'status');
            expect(output[1]).to.not.have.any.keys('project', '_csrf');
            assert.notEqual(objectA_status, output[1].description, 'Beside comparing, value in objectA must also be changed to mirror values of the same key in objectB.')
            assert.notEqual(objectA_description, output[1].description, 'Beside comparing, value in objectA must also be changed to mirror values of the same key in objectB.');
            assert.strictEqual(objectA.description, objectB.description, 'Values in objectA must be changed with reference to values of that key in objectB.');
            assert.strictEqual(objectA.status, objectB.status, 'Values in objectA must be changed with reference to values of that key in objectB.');
            assert.strictEqual(output[1].description, objectB.description, 'Beside having the same keys, the values must also be the same.');
            assert.strictEqual(output[1].status, objectB.status, 'Beside having the same keys, the values must also be the same.');


        })
    })


        test(`If objectB has a key .status with value: "Archived", objectA's .status must be changed accordingly.
        Also, the key .archived in objectA must be flipped to True, and the same boolean value be served at index 2 (two) of the output array.`, () => {
            let objectA = {
                reporter: 'repor',
                description: 'Desc',
                status: 'Open',
                archived: false,
            },
                objectB = {
                reporter: '',
                description: 'desc',
                status: 'Archived',
                _csrf: 'csrf_string'
            }
            output = update(objectA, objectB);
            expected = [ 2, { description: 'changed no loger desc', status: 'Archived' }, true ];
            assert.strictEqual(expected[1].status, objectB.status, 'Object in the output array at index 1 (one) must have a key .status with value equal to the value of key .status in objectB.');
            assert.strictEqual(expected[1].reporter, undefined, 'Object in the output array at index 1 (one) must not have a key .reporter, because the value of that key in objectB is an empty string.');
            assert.strictEqual(objectA.archived, expected[2], 'The output archived value must be true.')
            assert.strictEqual(output[2], true, 'Output array at index 2 (two) must have a boolean value: true, which reflects the value of key .archived objectA.');
            assert.strictEqual(objectA.archived, true, 'The value of key .archived in objectA must have been updated to true because key .status\' value is "Archived".');
        })

        test(`When new object has a property .status with a value of 'Reopened', the same property in the old object must be updated accordingly. Beside, .archived property in the old object must be updated to have a value of false.
        That same property must also be included in the output object stored at index 2 (two) of the output array, and index 2 (two) of the output array must reflect the value of .archived in the old object.`, () => {
            let objectA = {
                status: 'Archived',
                archived: true,
            },
                objectB = {
                status: 'Reopened',
                _csrf: 'csrf_string'
            }
            output = update(objectA, objectB);
            expected = [ 1, { status: 'Reopened' }, false ];
            assert.strictEqual(expected[1].status, objectB.status, 'Object in the output array at index 1 (one) must have a key .status with value equal to key .status\' in objectB.');
            assert.strictEqual(objectA.archived, expected[2], 'Output array at index 2 (two) must have boolean value: false, that reflect .archived value in objectA.');
            assert.strictEqual(objectA.archived, false, 'The value of key .archived objectA must have been updated because new .status value is "Reopened".');
        })

});
