const mongoose = require('mongoose');
const {MONGO_URI}= require('../config/globals')

/*/mongoose.connect(MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
},()=>console.log('Connected'))/*/

const usuariosCollection='usuarios';
const usuariosSchema = new mongoose.Schema({
 username: {type:String,required:true,max:100},
    password: {type:String,required:true,max:100},
})

module.exports= mongoose.model(usuariosCollection,usuariosSchema)