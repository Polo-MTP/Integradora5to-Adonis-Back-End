import Tank from '#models/tank'
import UserConfig from '#models/user_config'
import { Tankvalidator } from '#validators/tank'
import type { HttpContext } from '@adonisjs/core/http'
import SensorType from '#models/sensor_type'
import Device from '#models/device'
import SensorData from '#models/sensor_data'
import Alert from '#models/alert'
import { DateTime } from 'luxon'

export default class TanksController {
  async create({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const payload = await request.validateUsing(Tankvalidator)

      const tank = await Tank.create({
        name: payload.name,
        description: payload.description,
        isActive: false,
        userId: user.id,
        uuid: null,
      })

      for (const device of payload.devices) {
        const type = await SensorType.find(device.sensor_type_id)

        if (!type) continue

        for (let i = 0; i < device.quantity; i++) {
          Device.create({
            tankId: tank.id,
            name: `${type.name}/${i + 1}`,
            code: `${type.code}/${i + 1}`,
            sensorTypeId: type.id,
          })
        }
      }

      return response.json({
        success: true,
        data: tank,
        message: 'Tanque creado exitosamente',
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al crear el tanque',
        errors: error.messages || error.message,
      })
    }
  }

  async index({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tanks = await Tank.query().where('user_id', user.id).andWhere('is_active', true)

      if (tanks.length === 0) {
        return response.status(404).json({
          success: false,
          message: 'No se encontraron tanques',
        })
      }
      return response.json({
        success: true,
        data: tanks,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener los tanques',
        error: error.message,
      })
    }
  }

  async indexAll({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tanks = await Tank.query().where('user_id', user.id)

      return response.json({
        success: true,
        data: tanks, 
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener los tanques',
        error: error.message,
      })
    }
  }

  async delete({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tank = await Tank.query().where('id', params.id).where('user_id', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'Tanque no encontrado',
        })
      }

      await tank.delete()

      return response.json({
        success: true,
        message: 'Tanque eliminado exitosamente',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al eliminar el tanque',
        error: error.message,
      })
    }
  }

  // devuelve la pecera los dispositivos con los datos de los últimos sensores
  async show({ response, auth, params }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const tanks = await Tank.query()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .andWhere('is_active', true)
        .preload('devices', (query) => {
          query.preload('sensorType')
        })
        .first()

      if (!tanks) {
        return response.status(404).json({
          success: false,
          message: 'No se encontraron tanques',
        })
      }

      const tankJson = tanks.toJSON()
      const devicesWithData = []

      for (const device of tankJson.devices) {
        const ultimoDato = await SensorData.findOne({ deviceId: device.id })
          .sort({ date: -1 })
          .lean()

        devicesWithData.push({
          ...device,
          ultimoDato: ultimoDato || null,
        })
      }

      return response.json({
        success: true,
        data: {
          ...tankJson,
          devices: devicesWithData,
        },
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener los datos de los dispositivos',
        error: error.message,
      })
    }
  }

  // devuelve las alertas de los dispositivos del tanque
  async showAlerts({ response, auth, params }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const tanks = await Tank.query()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .preload('devices', (query) => {
          query.preload('sensorType')
        })
        .first()

      if (!tanks) {
        return response.status(404).json({
          success: false,
          message: 'No se encontraron tanques',
        })
      }

      const tankJson = tanks.toJSON()
      const devicesWithAlerts = []

      for (const device of tankJson.devices) {
        const alertas = await Alert.find({ deviceId: device.id }).sort({ date: -1 }).lean()

        devicesWithAlerts.push({
          ...device,
          alertas: alertas || [],
        })
      }

      return response.json({
        success: true,
        data: {
          ...tankJson,
          devices: devicesWithAlerts,
        },
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener las alertas de los dispositivos',
        error: error.message,
      })
    }
  }

  async stadistics({ response, auth, params }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const tanks = await Tank.query()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .preload('devices', (query) => {
          query.preload('sensorType')
        })
        .first()

      if (!tanks) {
        return response.status(404).json({
          success: false,
          message: 'No se encontraron tanques',
        })
      }

      const tankJson = tanks.toJSON()
      const devicesWithData = []

      for (const device of tankJson.devices) {
        const now = DateTime.now().setZone('America/Mexico_City')
        const endOfDayString = now.endOf('day').toUTC().toISO()
        const startOfWeekString = now.startOf('week').toUTC().toISO()

        // Datos ejemplo para debugging
        const sampleDates = await SensorData.find({ deviceId: device.id })
          .limit(5)
          .select('date -_id')
        console.log(
          'Primeras fechas de device:',
          sampleDates.map((d) => d.date)
        )
        console.log(
          'Rango de búsqueda - Inicio semana:',
          startOfWeekString,
          'Fin día:',
          endOfDayString
        )

        const ultimoDato = await SensorData.findOne({ deviceId: device.id })
          .sort({ date: -1 })
          .lean()

        // Datos agrupados por día dentro de la semana actual
        // POR DÍA (máx, mín, prom)
        const datosPorDia = await SensorData.aggregate([
          {
            $match: {
              deviceId: device.id,
              date: { $gte: startOfWeekString, $lte: endOfDayString },
            },
          },
          {
            $addFields: {
              dateConverted: { $dateFromString: { dateString: '$date' } },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$dateConverted' },
              },
              maximo: { $max: '$value' },
              minimo: { $min: '$value' },
              promedio: { $avg: '$value' },
              cantidad: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])

        devicesWithData.push({
          ...device,
          ultimoDato: ultimoDato || null,
          promedioDia: datosPorDia,
        })
      }

      return response.json({
        success: true,
        data: {
          ...tankJson,
          devices: devicesWithData,
        },
      })
    } catch (error) {
      console.error('Error en estadísticas:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener los datos de los dispositivos',
        error: error.message,
      })
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const data = await request.validateUsing(Tankvalidator)

      const tank = await Tank.query().where('id', params.id).where('user_id', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'Tanque no encontrado',
        })
      }

      tank.merge(data)
      await tank.save()

      return response.json({
        success: true,
        data: tank,
        message: 'Tanque actualizado exitosamente',
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al actualizar el tanque',
        error: error.message,
      })
    }
  }

  async addConfig({ params, request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const tank = await Tank.query().where('id', params.id).where('user_id', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'Tanque no encontrado',
        })
      }

      const config_name = request.input('config_name')
      const config_value = request.input('config_value')

      await UserConfig.create({
        config_name,
        config_value,
      })

      return response.json({
        success: true,
        message: 'Configuración registrada exitosamente',
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al registrar la configuración',
        error: error.message,
      })
    }
  }
}
