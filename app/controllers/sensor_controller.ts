import type { HttpContext } from '@adonisjs/core/http'
import SensorData from '#models/sensor_data'
import socketService from '#services/socket_service'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export default class SensorController {
  
  /**
   * Recibe datos de sensores desde Python y los emite por Socket.IO
   */
  async storeSensorData({ request, response }: HttpContext) {
    try {
      const {
        tank_id,
        sensor,
        device_id,
        code,
        value,
        unit,
        timestamp
      } = request.only([
        'tank_id',
        'sensor', 
        'device_id',
        'code',
        'value',
        'unit',
        'timestamp'
      ])

      // Validación básica
      if (!tank_id || !sensor || !device_id || value === undefined) {
        return response.status(400).json({
          success: false,
          message: 'Datos faltantes: tank_id, sensor, device_id y value son requeridos'
        })
      }

      // Crear el documento para MongoDB
      const sensorData = new SensorData({
        id_tank: tank_id,
        sensor: sensor,
        deviceId: device_id,
        code: code,
        value: parseFloat(value),
        unit: unit || 'N/A',
        date: timestamp ? new Date(timestamp) : new Date(),
        synced: true
      })

      // Guardar en MongoDB
      await sensorData.save()

      // Preparar datos para Socket.IO
      const socketData = {
        sensor: sensor,
        value: parseFloat(value),
        unit: unit || 'N/A',
        timestamp: timestamp || new Date().toISOString(),
        deviceId: device_id,
        code: code
      }

      // Emitir datos por Socket.IO a todos los usuarios conectados a este tanque
      socketService.emitSensorData(tank_id, socketData)

      // Verificar si hay alertas que enviar
      await this.checkAlerts(tank_id, sensor, parseFloat(value))

      logger.info(`📊 Datos de sensor procesados: Tank ${tank_id}, Sensor ${sensor}, Valor ${value}`)

      return response.json({
        success: true,
        message: 'Datos de sensor procesados y enviados exitosamente',
        data: {
          tank_id,
          sensor,
          value,
          timestamp: timestamp || new Date().toISOString()
        }
      })

    } catch (error) {
      logger.error('Error procesando datos de sensor:', error)
      return response.status(500).json({
        success: false,
        message: 'Error interno procesando datos de sensor',
        error: error.message
      })
    }
  }

  /**
   * Recibe múltiples datos de sensores en lote
   */
  async storeBatchSensorData({ request, response }: HttpContext) {
    try {
      const { sensor_data, timestamp: batch_timestamp } = request.only(['sensor_data', 'timestamp'])

      if (!Array.isArray(sensor_data) || sensor_data.length === 0) {
        return response.status(400).json({
          success: false,
          message: 'sensor_data debe ser un array no vacío'
        })
      }

      let processed = 0
      let errors = 0

      // Procesar cada dato en el lote
      for (const data of sensor_data) {
        try {
          const {
            tank_id = data.id_tank,
            sensor,
            device_id = data.deviceId,
            code,
            value,
            unit,
            timestamp = data.date
          } = data

          if (!tank_id || !sensor || !device_id || value === undefined) {
            errors++
            continue
          }

          // Crear documento para MongoDB
          const sensorDocument = new SensorData({
            id_tank: tank_id,
            sensor: sensor,
            deviceId: device_id,
            code: code,
            value: parseFloat(value),
            unit: unit || 'N/A',
            date: timestamp ? new Date(timestamp) : new Date(),
            synced: true
          })

          await sensorDocument.save()

          // Emitir por Socket.IO
          const socketData = {
            sensor: sensor,
            value: parseFloat(value),
            unit: unit || 'N/A',
            timestamp: timestamp || new Date().toISOString(),
            deviceId: device_id,
            code: code
          }

          socketService.emitSensorData(tank_id, socketData)
          processed++

        } catch (itemError) {
          logger.error('Error procesando item del lote:', itemError)
          errors++
        }
      }

      return response.json({
        success: true,
        message: `Lote procesado: ${processed} exitosos, ${errors} errores`,
        data: {
          processed,
          errors,
          total: sensor_data.length,
          batch_timestamp: batch_timestamp || new Date().toISOString()
        }
      })

    } catch (error) {
      logger.error('Error procesando lote de datos:', error)
      return response.status(500).json({
        success: false,
        message: 'Error procesando lote de datos',
        error: error.message
      })
    }
  }

  /**
   * Obtiene estadísticas de conexiones Socket.IO
   */
  async getSocketStats({ response }: HttpContext) {
    try {
      const stats = socketService.getStats()
      
      return response.json({
        success: true,
        data: stats
      })
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error)
      return response.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas'
      })
    }
  }

  /**
   * Verifica si los valores de los sensores están en rangos críticos y envía alertas
   */
  private async checkAlerts(tankId: number, sensor: string, value: number) {
    try {
      let alert = null

      // Definir rangos críticos para cada tipo de sensor
      switch (sensor) {
        case 'temp':
        case 'temperature':
          if (value < 18) {
            alert = {
              type: 'warning' as const,
              message: `🥶 Temperatura muy baja: ${value}°C`,
              sensor,
              value,
              timestamp: new Date().toISOString()
            }
          } else if (value > 28) {
            alert = {
              type: 'warning' as const, 
              message: `🔥 Temperatura muy alta: ${value}°C`,
              sensor,
              value,
              timestamp: new Date().toISOString()
            }
          } else if (value > 30) {
            alert = {
              type: 'error' as const,
              message: `🚨 Temperatura crítica: ${value}°C`,
              sensor,
              value,
              timestamp: new Date().toISOString()
            }
          }
          break

        case 'turbidity':
        case 'turbidez':
          if (value > 5) {
            alert = {
              type: 'warning' as const,
              message: `🌊 Turbidez alta detectada: ${value} NTU`,
              sensor,
              value,
              timestamp: new Date().toISOString()
            }
          } else if (value > 10) {
            alert = {
              type: 'error' as const,
              message: `🚨 Turbidez crítica: ${value} NTU`,
              sensor,
              value,
              timestamp: new Date().toISOString()
            }
          }
          break

        case 'ph':
          if (value < 6.0 || value > 8.5) {
            alert = {
              type: 'warning' as const,
              message: `⚖️ pH fuera del rango óptimo: ${value}`,
              sensor,
              value,
              timestamp: new Date().toISOString()
            }
          } else if (value < 5.5 || value > 9.0) {
            alert = {
              type: 'error' as const,
              message: `🚨 pH crítico: ${value}`,
              sensor,
              value,
              timestamp: new Date().toISOString()
            }
          }
          break
      }

      // Enviar alerta si se detectó algo crítico
      if (alert) {
        socketService.emitAlert(tankId, alert)
        logger.warn(`🚨 Alerta enviada para tanque ${tankId}:`, alert)
      }

    } catch (error) {
      logger.error('Error verificando alertas:', error)
    }
  }
}
