import User from '#models/user'
import { SensorTypevalidator } from '#validators/sensor_type'
import type { HttpContext } from '@adonisjs/core/http'
import SensorType from '#models/sensor_type'
import Tank from '#models/tank'
import Device from '#models/device'

export default class AdminController {
  async indexUsers({ response, request }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const perPage = Number(request.input('perPage', 10))
      let sortField = request.input('sortField', 'id')
      if (!sortField) {
        sortField = 'id'
      }
      const sortOrder = request.input('sortOrder', 'asc') === 'desc' ? 'desc' : 'asc'
      const globalFilter = request.input('globalFilter', '').trim().toLowerCase()

      const query = User.query()

      if (globalFilter) {
        query.where((q) => {
          q.whereRaw('LOWER(email) like ?', [`%${globalFilter}%`]).orWhereRaw(
            'LOWER(full_name) like ?',
            [`%${globalFilter}%`]
          )
        })
      }

      query.orderBy(sortField, sortOrder)

      const users = await query.paginate(page, perPage)

      return response.json({
        message: 'Usuarios cargados exitosamente',
        data: users.serialize().data,
        meta: {
          total: users.total,
        },
      })
    } catch (error) {
      return response.status(500).json({ message: 'Error interno', error: error.message })
    }
  }

  async indexSensors({ response }: HttpContext) {
    try {
      const sensor = await SensorType.query().orderBy('id', 'asc')

      return response.status(200).json({
        message: 'Sensores cargados exitosamente',
        data: sensor,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener los sensores',
        error: error.message,
      })
    }
  }

  async updateSensor({ response, params, request }: HttpContext) {
    try {
      const data = await request.validateUsing(SensorTypevalidator)

      const sensor = await SensorType.query().where('id', params.id).first()

      if (!sensor) {
        return response.status(404).json({
          success: false,
          message: 'Sensor no encontrado',
        })
      }
      sensor.merge(data)
      await sensor.save()

      return response.json({
        success: true,
        data: sensor,
        message: 'Sensor actualizado exitosamente',
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al actualizar el sensor',
        error: error.message,
      })
    }
  }

  async showTanksPendents({ response }: HttpContext) {
    try {
      const tanks = await Tank.query().where('is_active', 0)

      return response.status(200).json({
        message: 'Tanques pendientes cargados exitosamente',
        data: tanks,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener las peceras pendientes',
        error: error.message,
      })
    }
  }

  async showTankDetails({ response, params }: HttpContext) {
    try {
      const tank = await Tank.query().where('id', params.id).first()

      if (!tank) {
        return response.status(404).json({
          message: 'Tanque no encontrado',
        })
      }

      const devices = await Device.query().where('tankId', tank.id)

      const user = await User.query().where('id', tank.userId).first()

      return response.status(200).json({
        message: 'Tanque cargado exitosamente',
        tank: tank,
        devices: devices,
        user: user,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener el tanque',
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

  async aproveTank({ response, params, request }: HttpContext) {
    try {
      const tankId = params.id
      const uuid = request.input('uuid')

      if (!uuid) {
        return response.status(400).json({
          message: 'Falta el uuid',
        })
      }

      const existingTank = await Tank.query()
        .where('uuid', uuid)
        .whereNot('id', tankId) 
        .first()

      if (existingTank) {
        return response.status(409).json({
          message: 'El UUID ya está registrado en otra pecera',
        })
      }

      const tank = await Tank.query().where('id', tankId).first()

      if (!tank) {
        return response.status(404).json({
          message: 'Tanque no encontrado',
        })
      }

      tank.uuid = uuid
      tank.isActive = true

      await tank.save()
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
