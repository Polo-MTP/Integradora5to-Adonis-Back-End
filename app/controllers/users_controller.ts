import User from '#models/user'
import { updatedUserValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const payload = await request.validateUsing(updatedUserValidator)

      const updatedUser = await User.query().where('id', params.id).where('id', user.id).update({
        name: payload.name,
      })

      if (!updatedUser) {
        return response.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        })
      }

      return response.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al actualizar el usuario',
        errors: error.messages || error.message,
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
}
