const generateRandomString = () => {
  let randomString = '';
  let index = 6;
  while (index--) {
    let randomNum = Math.floor(Math.random() * (122 - 97)) + 97;
    var randomChar = String.fromCharCode(randomNum);
    randomString += randomChar;
  }
  return randomString;
};
module.exports.randomUrl = generateRandomString;
//console.log(generateRandomString());
