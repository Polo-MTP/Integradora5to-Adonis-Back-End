import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserConfig from '#models/user_config'

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

      return response.json({
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
      const user = await auth.authenticate()
      const config_type = request.input('config_type')
      const config_value = request.input('config_value')
      const code = request.input('code')

      await UserConfig.create({
        config_type,
        config_value,
        user_id: user.id,
        code,
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
