const {contenedorMongo} =require('../../contendores/contenedorMongo') 
const mongoose = require('mongoose');

const carritoCollection = 'carrito';

const carritoSchema = new mongoose.Schema({
    nombre :{type:Array, required:true, max:100},
    fecha:{type:Date,required:true},
    productos:{type:Array, required:true}
  
})


class carritoDaoMongo extends contenedorMongo{
    constructor(){
        super(carritoCollection,carritoSchema)
    }


    async save(obj){
        await this.model.create(obj);
        console.log('Mongo:Producto guardado'+ obj)
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
    
    async addProductoCarrito(id2,obj){
       let carrito = await this.model.find({_id:id2});
       console.log("carrito "+carrito)
       JSON.stringify(carrito)
       console.log("STRING "+carrito)
       JSON.parse(carrito);
       console.log("carrito "+carrito)
      // carrito.productos.push(obj)
       return console.log('Mongo:producto agregado')
    }
}   






module.exports = {carritoDaoMongo};