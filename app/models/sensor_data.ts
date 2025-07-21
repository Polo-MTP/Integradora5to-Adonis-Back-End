import mongoose from 'mongoose'

const sensorDataSchema = new mongoose.Schema({
  id_tank: {
    type: Number,
    required: true,
  },
  sensor: {
    type: String,
    required: true,
  },
  deviceId: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  synced: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'sensor_data', // Nombre de la colección en MongoDB
})

// Índices para mejorar las consultas
sensorDataSchema.index({ id_tank: 1, date: -1 })
sensorDataSchema.index({ deviceId: 1, date: -1 })
sensorDataSchema.index({ sensor: 1, date: -1 })

const SensorData = mongoose.model('SensorData', sensorDataSchema)

export default SensorData
