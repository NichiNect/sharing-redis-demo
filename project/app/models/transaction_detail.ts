import { DateTime } from 'luxon'
import { SnakeCaseNamingStrategy, BaseModel, column } from '@adonisjs/lucid/orm'

export default class TransactionDetail extends BaseModel {

  public static namingStrategy = new SnakeCaseNamingStrategy()

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare transaction_id: number

  @column()
  declare product_id: number

  @column()
  declare price: number

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}