import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserConfig from '#models/user_config'
import Tank from '#models/tank'

export default class UsersController {
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

  async addConfig({ request, response, auth }: HttpContext) {
    try {
      const tank_id = request.input('tank_id')

      if (!tank_id) {
        return response.status(400).json({
          success: false,
          message: 'ID del tanque es requerido',
        })
      }

      const user = await auth.authenticate()

      const tank = await Tank.query().where('id', tank_id).where('user_id', user.id).first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'Tanque no encontrado o no pertenece a este usuario',
        })
      }

      const config_type = request.input('config_type')
      const config_value = request.input('config_value')
      const config_day = request.input('config_day')
      const code = request.input('code')

      await UserConfig.create({
        config_type,
        config_value,
        config_day,
        code,
        tank_id,
      })

      return response.ok({
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

  async getConfigs({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const tankIds = await Tank.query()
        .where('user_id', user.id)
        .select('id')
        .then((rows) => rows.map((row) => row.id))

      if (tankIds.length === 0) {
        return response.ok({
          success: true,
          data: [],
          message: 'No hay peceras registradas para este usuario',
        })
      }

      const configs = await UserConfig.query()
        .whereIn('tank_id', tankIds)
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

  async updateConfig({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const configId = request.input('id_config')
      const newValue = request.input('config_value')
      const newDay = request.input('config_day')

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
        .where('id', configId)
        .whereIn('tank_id', tankIds)
        .first()

      if (!config) {
        return response.status(404).json({
          success: false,
          message: 'Configuración no encontrada o no pertenece a este usuario',
        })
      }

      if (newValue !== undefined) config.config_value = newValue
      if (newDay !== undefined) config.config_day = newDay

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
        error: error.message,
      })
    }
  }

  async deleteConfig({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const configId = request.input('id_config')

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
        .where('id', configId)
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
}
