const generateRandomString = () => {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  let index = 6;
  while (index--) {
    let randomNum = Math.floor(Math.random() * Math.floor(chars.length));
    var randomChar = chars[randomNum];
    randomString += randomChar;
  }
  return randomString;
};
module.exports.randomUrl = generateRandomString;
//console.log(generateRandomString());
