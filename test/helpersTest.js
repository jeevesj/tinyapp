const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    const randomEmail = "noone@gmail.com"
    assert.strictEqual(user.id, expectedUserID);
  it('should return undefined when passed an email not in the users database', function() {
      const nonExistentEmail = "blah@example.com";
      const user = getUserByEmail(nonExistentEmail, testUsers);
      assert.strictEqual(user, undefined);
  });
  });
});