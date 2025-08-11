import Tank from '#models/tank'
import SensorData from '#models/sensor_data'
import type { HttpContext } from '@adonisjs/core/http'
import UserConfig from '#models/user_config'

export default class RaspberriesController {
  // Controlador modificado para incluir sensor_type con time_interval
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

      // Cargar devices con su relación sensor_type
      const data = await pecera.related('devices').query().preload('sensorType') // Asumiendo que la relación se llama 'sensorType'

      // Transformar los datos para incluir time_interval
      const devicesWithInterval = data.map((device) => ({
        id: device.id,
        tank_id: device.tankId,
        sensor_type_id: device.sensorTypeId,
        name: device.name,
        code: device.code,
        created_at: device.createdAt,
        updated_at: device.updatedAt,
        // Información del sensor type
        sensor_type: {
          id: device.sensorType.id,
          name: device.sensorType.name,
          code: device.sensorType.code,
          reading_interval: device.sensorType.readingInterval, // ¡Aquí está!
          is_active: device.sensorType.isActive,
          created_at: device.sensorType.createdAt,
          updated_at: device.sensorType.updatedAt,
        },
      }))

      response.json(devicesWithInterval)
    } catch (error) {
      console.error(error)
      return response.status(404).json({
        success: false,
        message: 'Error al obtener dispositivos',
        error: error.message,
      })
    }
  }

  async indexConfig({ response, request }: HttpContext) {
    try {
      const uuid = request.input('uuid')
      const pecera = await Tank.findBy('uuid', uuid)

      if (!pecera) {
        return response.status(404).json({
          success: false,
          message: 'No se encontró la pecera con ese UUID',
          error: 'No se encontró la pecera con ese UUID',
        })
      }

      const configuraciones = await UserConfig.query().where('tank_id', pecera.id)

      const configs = configuraciones.map((config) => ({
        code: config.code,
        config_type: config.config_type,
        config_day: config.config_day,

        config_value: config.config_value,
      }))

      return response.json(configs)
    } catch (error) {
      console.error('❌ Error al obtener configuraciones:', error)
      return response.status(500).json({
        success: false,
        message: 'Error del servidor al obtener configuraciones',
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
          error: 'Usuario no autenticado',
        })
      }

      const tank = await Tank.query().where('userId', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'No se encontró una pecera asociada al usuario',
          error: 'Tank not found for user',
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
            description: tank.description,
          },
          sensors: sensorData,
          total_records: sensorData.length,
        },
      })
    } catch (error) {
      console.error('Error al obtener los últimos datos:', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
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
          error: 'Usuario no autenticado',
        })
      }

      if (!sensorType) {
        return response.status(400).json({
          success: false,
          message: 'El tipo de sensor es requerido',
          error: 'Sensor parameter is required',
        })
      }

      const tank = await Tank.query().where('userId', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'No se encontró una pecera asociada al usuario',
          error: 'Tank not found for user',
        })
      }

      const sensorData = await SensorData.find({
        id_tank: tank.id,
        sensor: sensorType,
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
            uuid: tank.uuid,
          },
          sensor_type: sensorType,
          readings: sensorData,
          total_records: sensorData.length,
        },
      })
    } catch (error) {
      console.error('Error al obtener datos por sensor:', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      })
    }
  }
}
