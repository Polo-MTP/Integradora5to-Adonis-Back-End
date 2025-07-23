import Tank from '#models/tank'
import SensorData from '#models/sensor_data'
import type { HttpContext } from '@adonisjs/core/http'

export default class RaspberriesController {
  
  async index({ response, request }: HttpContext) {
    
    try {
      const Uuid = request.input('uuid')

      const pecera = await Tank.findBy('uuid', Uuid)

      if (!pecera) {
        return response.status(404).json({
          success: false,
          message: 'No se encontró la pecera con ese UUID',
          error: 'No se encontró la pecera con ese UUID',
        })
      }
      
      const data = await pecera.related('devices').query()

      response.json(data)
    } catch (error) {
      console.error(error)
      return response.status(404).json({
        success: false,
        message: 'No se encontró la pecera con ese UUID',
        error: error.message,
      })
    }
  }

  async lastdate({ auth, response, request }: HttpContext) {
    try {
      const user = auth.user
      const limit = request.input('limit', 10) 

      if (!user) {
        return response.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'Usuario no autenticado'
        })
      }

      
      const tank = await Tank.query().where('userId', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'No se encontró una pecera asociada al usuario',
          error: 'Tank not found for user'
        })
      }

      
      const sensorData = await SensorData.find({ id_tank: tank.id })
        .sort({ date: -1 }) 
        .limit(parseInt(limit))
        .exec()

      return response.status(200).json({
        success: true,
        message: 'Últimos datos obtenidos exitosamente',
        data: {
          tank: {
            id: tank.id,
            name: tank.name,
            uuid: tank.uuid,
            description: tank.description
          },
          sensors: sensorData,
          total_records: sensorData.length
        }
      })

    } catch (error) {
      console.error('Error al obtener los últimos datos:', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      })
    }
  }

  // Método para obtener los últimos datos por sensor específico
  async lastBySensor({ auth, response, request }: HttpContext) {
    try {
      const user = auth.user
      const sensorType = request.input('sensor') // temp, ph, etc.
      const limit = request.input('limit', 5)

      if (!user) {
        return response.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'Usuario no autenticado'
        })
      }

      if (!sensorType) {
        return response.status(400).json({
          success: false,
          message: 'El tipo de sensor es requerido',
          error: 'Sensor parameter is required'
        })
      }

      // Buscar la pecera del usuario
      const tank = await Tank.query().where('userId', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'No se encontró una pecera asociada al usuario',
          error: 'Tank not found for user'
        })
      }

      // Obtener datos específicos del sensor
      const sensorData = await SensorData.find({ 
        id_tank: tank.id, 
        sensor: sensorType 
      })
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .exec()

      return response.status(200).json({
        success: true,
        message: `Últimos datos del sensor ${sensorType} obtenidos exitosamente`,
        data: {
          tank: {
            id: tank.id,
            name: tank.name,
            uuid: tank.uuid
          },
          sensor_type: sensorType,
          readings: sensorData,
          total_records: sensorData.length
        }
      })

    } catch (error) {
      console.error('Error al obtener datos por sensor:', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      })
    }
  }
}
