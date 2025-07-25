import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class OnlyAdminMiddleware {
  public async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = auth?.user

    if (!user || user.rol !== 'admin') {
      return response.status(403).json({
        message: 'Acceso denegado. Solo los administradores pueden realizar esta acción.',
      })
    }
    await next()
  }
}
