import UserConfig from '#models/user_config'
import type { HttpContext } from '@adonisjs/core/http'

export default class ConfigsController {
  async getConfigUser({ response, params }: HttpContext) {
    try {
      const userId = params.id
      const config = await UserConfig.query().where('user_id', userId).first()

      if (!config) {
        return response.status(404).json({
          message: 'Configuración no encontrada para el usuario',
        })
      }

      return response.json(config)
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener la configuración del usuario',
        error: error.message,
      })
    }
  }
}
