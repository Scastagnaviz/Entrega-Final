const {contenedorMongo} =require('../../contendores/contenedorMongo') 

const mongoose = require('mongoose');

const productoCollection = 'productos';

const productoSchema = new mongoose.Schema({
nombre :{type:String,/*/required:true, max:100/*/},
descripcion :{type:String,/*/required:true, max:100/*/},
codigo: {type:Number/*/,required:true/*/},
precio: {type:Number/*/,required:true/*/},
stock: {type:Number/*/,required:true/*/}, 
url:{type:String/*/,required:true,max:100/*/},
})

//const productosModel = mongoose.model(productoCollection,productoSchema)

class productoDaoMongo extends contenedorMongo{
constructor(){
    super(productoCollection,productoSchema);
}

async save(obj){
    await this.model.create(obj);
    console.log('Mongo:Producto guardado')
}

async getAll(){
        return await this.model.find({}); 
}
async  getById(id2){
    return await this.model.find({_id:id2},{})
}

async  delete(id2){
    
        await this.model.deleteOne({_id:id2})
        return console.log('Mongo:Producto eliminado')
}

async update(id2,obj){
    
    await this.model.updateOne({_id:id2},{
        $set :{nombre:obj}
    }) 
    return console.log('Mongo:Producto actulizado') 
}
}




module.exports = {productoDaoMongo};