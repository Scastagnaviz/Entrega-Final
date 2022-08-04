const mongoose = require('mongoose');
//Esto va adentro o afuera de class?


class contenedorMongo{
constructor(collection,schema){
    mongoose.connect('mongodb://localhost:27017/ecommerce',{
        useNewUrlParser: true,
        useUnifiedTopology:true
            })
    console.log('Base de datos MongoDB conectada');
    this.model=  mongoose.model(collection,schema);
    }
    
    async getAll(){
        return await this.model.find()
      }
    

    } ;


    


module.exports = {contenedorMongo};