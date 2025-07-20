import User from '#models/user'
import { SensorTypevalidator } from '#validators/sensor_type'
import type { HttpContext } from '@adonisjs/core/http'
import SensorType from '#models/sensor_type'

export default class AdminController {
  async getUsers({ response }: HttpContext) {
    try {
      const data = await User.query()

      return response.json(data)
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener los usuarios',
        error: error.message,
      })
    }
  }

  async showTanksPendents({ response }: HttpContext) {
    try {
      const tanks = await User.query().where('is_active', 0)

      return response.json(tanks)
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener las peceras pendientes',
        error: error.message,
      })
    }
  }

  async showDevicesUser({ response, params }: HttpContext) {
    try {
      const userId = params.id
      const user = await User.query().where('id', userId)

      if (user.length === 0) {
        return response.status(404).json({
          message: 'Usuario no encontrado',
        })
      }

      return response.json(user)
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener los dispositivos del usuario',
        error: error.message,
      })
    }
  }

  async aproveTank({ response, params }: HttpContext) {
    try {
      const userId = params.id
      const user = await User.query().where('id', userId)

      if (user.length === 0) {
        return response.status(404).json({
          message: 'Usuario no encontrado',
        })
      }

      await User.query().where('id', userId).update({ is_active: 1 })

      return response.json({
        message: 'Pecera aprobada correctamente',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al aprobar la pecera',
        error: error.message,
      })
    }
  }
  async createSensorType({ response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(SensorTypevalidator)

      const sensorType = await SensorType.create({
        name: payload.name,
        code: payload.code,
      })

      return response.json({
        message: 'SensorType creado exitosamente',
        data: sensorType,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al crear el sensorType',
        errors: error.messages || error.message,
      })
    }
  }

  async indexSensorTypes({ response }: HttpContext) {
    try {
      const sensorTypes = await SensorType.query().where('is_active', true)

      if (sensorTypes.length === 0) {
        return response.status(404).json({
          message: 'No se encontraron sensorTypes',
        })
      }

      return response.json({
        message: 'SensorTypes cargados exitosamente',
        data: sensorTypes,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Error al crear el sensorType',
        errors: error.messages || error.message,
      })
    }
  }
}
