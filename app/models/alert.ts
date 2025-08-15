import mongoose from "mongoose";


const alertSchema = new mongoose.Schema({
  id_tank: {
    type: Number,
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
  message: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
  collection: 'alertas' 
})

alertSchema.index({ id_tank: 1, date: -1 })
alertSchema.index({ deviceId: 1, date: -1 })
alertSchema.index({ code: 1, date: -1 })

const Alert = mongoose.model('alertas', alertSchema)

export default Alert