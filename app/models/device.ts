import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tank from './tank.js'
import SensorType from './sensor_type.js'

export default class Device extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tankId: number

  @column()
  declare sensorTypeId: number 

  @column()
  declare name: string

  @column()
  declare code: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Tank)
  declare tank: BelongsTo<typeof Tank>

  @belongsTo(() => SensorType, {
    foreignKey: 'sensorTypeId',
  })
  declare sensorType: BelongsTo<typeof SensorType> 
}