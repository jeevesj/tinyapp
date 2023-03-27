

function getUserByEmail(email, database) { 
  for (const user_id in database) {
    if (database[user_id].email === email) {
      return database[user_id];
    }
  }
  return null;
}

function urlsforUser(urlDatabase, userId) {
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
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};






module.exports = { getUserByEmail, generateRandomString, urlsforUser }