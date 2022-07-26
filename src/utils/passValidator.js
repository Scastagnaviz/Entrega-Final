const bCrypt= require('bcrypt');

function validatePass(user,password){
    return bCrypt.compareSync(password,user.password)
}

module.exports={validatePass }