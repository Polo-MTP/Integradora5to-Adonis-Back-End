import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tank from './tank.js'

export default class UserConfig extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare config_name: string

  @column()
  declare config_type: string

  @column()
  declare code: string

  @column()
  declare config_day: number

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column()
  declare config_value: DateTime

  @column()
  declare tank_id: number

  @belongsTo(() => Tank)
  declare tank: BelongsTo<typeof Tank>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
