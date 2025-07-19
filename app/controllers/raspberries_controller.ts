import Tank from '#models/tank'
import type { HttpContext } from '@adonisjs/core/http'

export default class RaspberriesController {
  async index({ response, request }: HttpContext) {
    
    try {
      const Uuid = request.input('uuid')

      const pecera = await Tank.findBy('uuid', Uuid)

      if (!pecera) {
        return response.status(404).json({
          success: false,
          message: 'No se encontró la pecera con ese UUID',
          error: 'No se encontró la pecera con ese UUID',
        })
      }
      
      const data = await pecera.related('devices').query()

      response.json(data)
    } catch (error) {
      console.error(error)
      return response.status(404).json({
        success: false,
        message: 'No se encontró la pecera con ese UUID',
        error: error.message,
      })
    }
  }
}
