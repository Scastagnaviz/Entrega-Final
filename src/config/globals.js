require('dotenv').config()

module.exports={
    MONGO_URI : process.env.MONGO_URI || '' ,
   // FIRESTORE_FILE: process.env.FIRESTORE_FILE || '',
    TIEMPO_EXPIRACION: process.env.TIEMPO_EXPIRACION || 3000
}
