import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, scope, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import TransactionDetail from './transaction_detail.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

type IStatusValue = 'waiting_payment' | 'new' | 'inprogress' | 'delivery' | 'done' | 'cancel'

export default class Transaction extends BaseModel {

  public static namingStrategy = new SnakeCaseNamingStrategy()

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare transaction_number: string

  @column()
  declare invoice_number: string

  @column()
  declare status: IStatusValue

  @column()
  declare user_id: number

  @column()
  declare price: number

  @column()
  declare fee_price: number

  @column()
  declare total_price: number

  @column.dateTime()
  declare expired_payment: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * * Status Filter Scopes
   */
  public static statusFilter = scope((query: any, statusFilter: IStatusValue[]) => {
    if (Array.isArray(statusFilter) && statusFilter?.length > 0) {
      query.whereIn('status', statusFilter)
    }
  })

  @hasMany(() => TransactionDetail, {
    localKey: 'id',
    foreignKey: 'transaction_id'
  })
  declare transaction_details: HasMany<typeof TransactionDetail>
}