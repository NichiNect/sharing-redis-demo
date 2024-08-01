import Product from '#models/product'
import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { CodeAllocator } from '../helpers/code_allocator.js'
import TransactionDetail from '#models/transaction_detail'
import { DateTime } from 'luxon'
import stringHelpers from '@adonisjs/core/helpers/string'

export default class TransactionsController {

    private FEE_TRANSACTION: number = 2000

    /**
     * Display transaction list
     */
    public async index({ request, response }: HttpContext) {

        const search: string = request.input('search') || ''
        const page: number = request.input('page') || 1
        const limit: number = request.input('limit') || 10
        const statusFilter = request.input('statusFilter') || []
        const userFilter = request.input('userFilter') || null

        // * Find Data
        const transactions = await Transaction.query()
            .preload('transaction_details')
            .withScopes((scopes) => scopes.statusFilter(statusFilter))
            .if(search != '', (query: any) => {

                return query.where((q: any) => {
                    q.where('transaction_number', 'LIKE', `%${search}%`)
                        .orWhere('invoice_number', 'LIKE', `%${search}%`)
                })
            })
            .if(userFilter, (query: any) => {

                return query.where('user_id', userFilter)
            })
            .orderBy('created_at', 'desc')
            .paginate(page, limit)

        // * Response
        return response.send({
            message: 'Success',
            data: transactions
        })
    }

    /**
     * Handle create transaction
     */
    public async createTransaction({ request, response }: HttpContext) {

        // * DTO Schema Create Transaction
        const transactionSchema = vine.object({
            user_id: vine.number(),
            details: vine.array(
                vine.object({
                    product_id: vine.number(),
                    quantity: vine.number().min(1),
                })
            )
        })

        const validatedData = await vine.validate({
            schema: transactionSchema,
            data: request.all()
        })

        // * Check Product ID
        let totalPrice: number = 0
        const prepareDetailData = []
        for (const [key, item] of validatedData.details?.entries()) {
            
            const product = await Product.findBy('id', item.product_id)

            if (!product) {
                return response.abort({
                    message: `Validation Error: failed to find product at index of ${key}`,
                    "errors": [
                        {
                            "rule": "custom: not exists",
                            "field": "product_id",
                            "message": "The product id is not found at our records"
                        }
                    ]
                })
            }

            // * Counter total price
            totalPrice += (product.price * item.quantity)

            // * Assign to prepareDetailData for preparing data
            prepareDetailData.push({
                product_id: product.id,
                price: product.price,
                quantity: item.quantity,
                created_at: DateTime.now(),
                updated_at: DateTime.now()
            })
        }

        // * Generate Transaction Number
        const code = await CodeAllocator.generate('TRX')
        if (!code) {
            return response.abort({
                message: 'Error: failed to generate code allocator',
                err: null
            }, 500)
        }

        // * Store to transactions DB
        const transaction = await Transaction.create({
            transaction_number: code,
            invoice_number: stringHelpers.random(32),
            status: 'waiting_payment',
            user_id: validatedData.user_id,
            price: totalPrice,
            fee_price: this.FEE_TRANSACTION,
            total_price: totalPrice + this.FEE_TRANSACTION,
            expired_payment: DateTime.now().plus({ minutes: 5 })
        })

        // * Store to transaction_details DB
        const assignTransactionId = prepareDetailData.map((item: any) => {
            return {
                transaction_id: transaction.id,
                ...item,
            }
        })

        const details = await TransactionDetail.createMany(assignTransactionId)

        const result: any = transaction
        result.transaction_details = details

        // * Response
        return response.send({
            message: 'Success',
            data: result
        })
    }

    /**
     * Handle update status transaction
     */
    public async updateStatus({ request, response }: HttpContext) {

        const id = request.param('id')

        // * DTO Schema Create Transaction
        const transactionSchema = vine.object({
            status: vine.enum(['new', 'inprogress', 'delivery', 'done', 'cancel']),
        })

        const validatedData = await vine.validate({
            schema: transactionSchema,
            data: request.all()
        })

        // * Find Data
        const transaction = await Transaction.query()
            .preload('transaction_details')
            .where('id', id)
            .first()

        if (!transaction) {
            return response.abort({
                message: 'Data not found'
            }, 404)
        }

        switch (validatedData.status) {
            case 'new': {
                transaction.status = 'new'
            } break
            case 'inprogress': {
                transaction.status = 'inprogress'
            } break
            case 'delivery': {
                transaction.status = 'delivery'
            } break
            case 'done': {
                transaction.status = 'done'
            } break
            case 'cancel': {
                transaction.status = 'cancel'
            } break
        }

        await transaction.save()

        // * Response
        return response.send({
            message: 'Success',
            data: transaction
        })
    }

}