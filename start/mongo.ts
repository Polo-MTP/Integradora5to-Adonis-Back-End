import mongoose from 'mongoose'

const user = process.env.MONGO_USER
const pass = process.env.MONGO_PASS
const cluster = process.env.MONGO_CLUSTER
const db = process.env.MONGO_DB

const uri = `mongodb+srv://${user}:${pass}@${cluster}/${db}?retryWrites=true&w=majority`

mongoose
  .connect(uri, {
    dbName: db,
  })
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB Atlas:', err))

export default mongoose
