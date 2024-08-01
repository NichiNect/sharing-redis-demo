import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('transaction_number', 64).unique()
      table.string('invoice_number', 64)
      table.enum('status', ['waiting_payment', 'new', 'inprogress', 'delivery', 'done', 'cancel'])
      table.integer('user_id')
      table.integer('price').unsigned()
      table.integer('fee_price').unsigned()
      table.integer('total_price').unsigned()
      table.timestamp('expired_payment')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}