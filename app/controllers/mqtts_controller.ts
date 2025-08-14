import type { HttpContext } from '@adonisjs/core/http'
import Tank from '#models/tank'
import MqttService from '#services/MqttService'
import UserConfig from '#models/user_config'

export default class MqttsController {
  async ServirComida({ response, params }: HttpContext) {
    try {
      const peceraID = params.id

      const pecera = await Tank.query().where('id', peceraID).first()

      if (!pecera) {
        return response.status(404).json({
          success: false,
          message: 'No se encontro la pecera',
          error: 'No se encontro la pecera',
        })
      }

      const topic = `conf/uuid/code`
      const mensaje = 'food'

      MqttService.publish(topic, mensaje)

      return response.json({
        success: true,
        message: 'Comida servida exitosamente',
        data: {
          pecera: {
            id: pecera.id,
            name: pecera.name,
            uuid: pecera.uuid,
            description: pecera.description,
          },
        },
      })
    } catch (error) {
      return response.status(401).json({
        success: false,
        message: 'No se encontro el usuario o la pecera',
        error: error.message,
      })
    }
  }


  async encenderLed({ response, params }: HttpContext) {
    try {
      const peceraID = params.id

      const pecera = await Tank.query().where('id', peceraID).first()

      if (!pecera) {
        return response.status(404).json({
          success: false,
          message: 'No se encontro la pecera',
          error: 'No se encontro la pecera',
        })
      }

      const topic = `conf/uuid/code`
      const mensaje = 'on'

      MqttService.publish(topic, mensaje)

      return response.json({
        success: true,
        message: 'Encendido exitosamente',
        data: {
          pecera: {
            id: pecera.id,
            name: pecera.name,
            uuid: pecera.uuid,
            description: pecera.description,
          },
        },
      })

    } catch (error) {
      return response.status(401).json({
        success: false,
        message: 'No se encontro el usuario o la pecera',
        error: error.message,
      })
    }
  }

  async apagarLed({ response, params }: HttpContext) {
    try {
      const peceraID = params.id
      const pecera = await Tank.query().where('id', peceraID).first()

      if (!pecera) {
        return response.status(404).json({
          success: false,
          message: 'No se encontro la pecera',
          error: 'No se encontro la pecera',
        })
      }

      const topic = `conf/uuid/code`
      const mensaje = 'off'

      MqttService.publish(topic, mensaje)

      return response.json({
        success: true,
        message: 'Apagado exitosamente',
        data: {
          pecera: {
            id: pecera.id,
            name: pecera.name,
            uuid: pecera.uuid,
            description: pecera.description,
          },
        },
      })
    } catch (error) {
      return response.status(401).json({
        success: false,
        message: 'No se encontro el usuario o la pecera',
        error: error.message,
      })
    }
  } 

  async addConfig({ request, response,  params }: HttpContext) {
    try {
      const id = params.id

      const pecera = await Tank.query().where('id', id).first()

      if (!pecera) {
        return response.status(404).json({
          success: false,
          message: 'No se encontro la pecera',
          error: 'No se encontro la pecera',
        })
      }
      const config_type = request.input('config_type') // nombre de como le pones a la coinfiguracio
      const config_value = request.input('config_value')  // hora en 24 horas
      const code = request.input('code') // food, on , off

      await UserConfig.create({
        config_type,
        config_value,
        tank_id: pecera.id,
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
