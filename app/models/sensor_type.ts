import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SensorType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number


  @column()
  declare name: string

  @column()
  declare code: string

  @column()
  declare isActive: boolean

  
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}