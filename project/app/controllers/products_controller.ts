import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import { CacheManager } from '../helpers/cache_manager.js'
import vine from '@vinejs/vine'
import stringHelpers from '@adonisjs/core/helpers/string'
import { CodeAllocator } from '../helpers/code_allocator.js'

export default class ProductsController {

    public async getWithoutCache({ request, response }: HttpContext) {

        const search: string = request.input('search') || ''
        const page: number = request.input('page') || 1
        const limit: number = request.input('limit') || 10

        // * Find Data
        const products = await Product.query()
            .if (search != '', (query: any) => {
                return query.where((q: any) => {
                    q.where('name', 'LIKE', `%${search}%`)
                })
            })
            .where('is_active', true)
            .orderBy('created_at', 'desc')
            .paginate(page, limit)

        // * Response
        return response.send({
            message: 'Success',
            data: products
        })
    }

    public async getWithCache({ request, response }: HttpContext) {

        const search: string = request.input('search') || ''
        const page: number = request.input('page') || 1
        const limit: number = request.input('limit') || 10

        const cacheManager = new CacheManager()

        // * Find in Cache
        const cache = await cacheManager.get('product', {
            params: {page,limit,search}
        })

        if (cache) {
            return response.send({
                message: 'Success',
                data: cache
            })
        }

        // * Query to DB
        const products = await Product.query()
            .if (search != '', (query: any) => {
                return query.where((q: any) => {
                    q.where('name', 'LIKE', `%${search}%`)
                })
            })
            .where('is_active', true)
            .orderBy('created_at', 'desc')
            .paginate(page, limit)

        // * Create new Cache
        await cacheManager.set('product', {
            params: {page,limit,search}
        }, products)

        // * Response
        return response.send({
            message: 'Success',
            data: products
        })
    }

    public async storeWithCache({ request, response }: HttpContext) {

        // * DTO Schema Creation
        const productSchema = vine.object({
            name: vine.string().maxLength(255),
            description: vine.string().minLength(5),
            price: vine.number().min(0),
            is_active: vine.boolean()
        })

        const validatedData = await vine.validate({
            schema: productSchema,
            data: request.all()
        })

        // * Generate Product Code
        const code = await CodeAllocator.generate('PRD')
        if (!code) {
            return response.abort({
                message: 'Error: failed to generate code allocator',
                err: null
            })
        }

        // * Store to DB
        const newProduct = await Product.create({
            name: validatedData.name,
            slug: stringHelpers.slug(validatedData.name),
            code,
            description: validatedData.description,
            price: validatedData.price,
            is_active: validatedData.is_active,
        })

        // * Flush Product Cache
        const cacheManager = new CacheManager()
        await cacheManager.flushCache('product')

        // * Response
        return response.send({
            message: 'Success',
            data: newProduct
        })
    }
}