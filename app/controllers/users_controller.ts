import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserConfig from '#models/user_config'
import Tank from '#models/tank'
import { addConfigValidator } from '#validators/config'
import { updateConfigValidator } from '#validators/config'

export default class UsersController {
  async addConfig({ request, response, auth, params }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const payload = await request.validateUsing(addConfigValidator)

      const tankId = params.id
      
      const tank = await Tank.query()
        .where('id', tankId)
        .where('user_id', user.id)
        .first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'Tanque no encontrado o no pertenece a este usuario',
        })
      }

      await UserConfig.create({
        config_type: payload.config_type,
        config_value: payload.config_value,
        config_day: payload.config_day || null,
        code: payload.code,
        tank_id: tank.id,
      })

      return response.ok({
        success: true,
        message: 'Configuración registrada exitosamente',
        data: {
          code: payload.code,
          hora: payload.config_value,
          day: payload.config_day ,
        }
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al registrar la configuración',
        error: error.messages || error.message,
      })
    }
  }

  async getConfigs({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tankId = params.id

      const tank = await Tank.query().where('id', tankId).where('user_id', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'Tanque no encontrado o no pertenece a este usuario',
        })
      }

      const configs = await UserConfig.query()
        .where('tank_id', tank.id)
        .select([
          'id',
          'config_type',
          'config_day',
          'config_value',
          'code',
          'created_at',
          'updated_at',
          'tank_id',
        ])

      return response.ok({
        success: true,
        data: configs,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener las configuraciones del usuario',
        error: error.message,
      })
    }
  }

  async updateConfig({ params, response, request }: HttpContext) {
    try {
      const configId = params.id_config
      
      const payload = await request.validateUsing(updateConfigValidator)

      const config = await UserConfig.query()
        .where('id', configId)
        .first()

      if (!config) {
        return response.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
        })
      }

      if(payload.config_value !== undefined) config.config_value = payload.config_value
      if(payload.config_day !== undefined) config.config_day = payload.config_day

      await config.save()

      return response.ok({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: config,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al actualizar la configuración',
        error: error.messages || error.message,
      })
    }
  }

  async deleteConfig({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { id_config } = params

      const tankIds = await Tank.query()
        .where('user_id', user.id)
        .select('id')
        .then((rows) => rows.map((row) => row.id))

      if (tankIds.length === 0) {
        return response.status(404).json({
          success: false,
          message: 'No se encontraron peceras para este usuario',
        })
      }

      const config = await UserConfig.query()
        .where('id', id_config)
        .whereIn('tank_id', tankIds)
        .first()

      if (!config) {
        return response.status(404).json({
          success: false,
          message: 'Configuración no encontrada o no pertenece a este usuario',
        })
      }

      await config.delete()

      return response.ok({
        success: true,
        message: 'Configuración eliminada exitosamente',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al eliminar la configuración',
        error: error.message,
      })
    }
  }

  async disableConfig({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { id_config } = params

      const tankIds = await Tank.query()
        .where('user_id', user.id)
        .select('id')
        .then((rows) => rows.map((row) => row.id))

      if (tankIds.length === 0) {
        return response.status(404).json({
          success: false,
          message: 'No se encontraron peceras para este usuario',
        })
      }

      const config = await UserConfig.query()
        .where('id', id_config)
        .whereIn('tank_id', tankIds)
        .first()

      if (!config) {
        return response.status(404).json({
          success: false,
          message: 'Configuración no encontrada o no pertenece a este usuario',
        })
      }

      config.isActive = false
      await config.save()

      return response.ok({
        success: true,
        message: 'Configuración desactivada exitosamente',
        data: config,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al desactivar la configuración',
        error: error.message,
      })
    }
  }

  async showInfo({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const userInfo = await User.query().where('id', user.id).first()

      if (!userInfo) {
        return response.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        })
      }

      return response.ok({
        success: true,
        data: userInfo,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener la información del usuario',
        error: error.message,
      })
    }
  }
}
