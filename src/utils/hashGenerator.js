const bCrypt = require('bcrypt');

function createHash(password){
    return bCrypt.hashSync(password,bCrypt.genSaltSync(10),null);
}

module.exports= {createHash}