import Tank from '#models/tank'
import { Tankvalidator } from '#validators/tank'
import type { HttpContext } from '@adonisjs/core/http'

export default class TanksController {
  async create({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const data = await request.validateUsing(Tankvalidator)

      const tank = await Tank.create({
        ...data,
        user_id: user.id,
      })

      return response.status(201).json({
        success: true,
        data: tank,
        message: 'Tanque creado exitosamente',
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al crear el tanque',
        error: error.message,
      })
    }
  }

  // Obtener todos los tanques del usuario autenticado
  async index({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tanks = await Tank.query().where('user_id', user.id).preload('devices').preload('user')

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

  async show({ params, response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const tank = await Tank.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .preload('devices')
        .preload('user')
        .first()

      if (!tank) {
        return response.status(404).json({
          success: false,
          message: 'Tanque no encontrado',
        })
      }

      return response.json({
        success: true,
        data: tank,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener el tanque',
        error: error.message,
      })
    }
  }

  // Actualizar un tanque
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
}
