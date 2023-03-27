

function getUserByEmail(email, database) { 
  //returns user id if it finds their email in database
  for (const user_id in database) {
    if (database[user_id].email === email) {
      return database[user_id];
    }
  }
  return null;
}

function urlsforUser(urlDatabase, userId) {
  //returns urls that match a user's ID
  const filteredUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      filteredUrls[shortURL] = urlDatabase[shortURL];
    }
  }
    return filteredUrls;
};

function generateRandomString() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //generates a random 6 character string using the math random function and character position of 'chars'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};






module.exports = { getUserByEmail, generateRandomString, urlsforUser }