import mongoose from 'mongoose'

const mongoUriEnv = process.env.MONGO_URI
const db = process.env.MONGO_DB

const uri = mongoUriEnv?.includes('?') 
  ? mongoUriEnv.replace('?', `/${db}?`)
  : `${mongoUriEnv}/${db}`

mongoose
  .connect(uri, {
    dbName: db,
  })
  .then(() => console.log('✅ Conectado a MongoDB Replica Set'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB Replica Set:', err))

export default mongoose