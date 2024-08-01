/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { CodeAllocator } from '../app/helpers/code_allocator.js'
import { ProductFactory } from '#database/factories/product_factory'
import ProductsController from '#controllers/products_controller'
import { CacheManager } from '../app/helpers/cache_manager.js'
import TransactionsController from '#controllers/transactions_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/code-allocator', async () => {

  const code = await CodeAllocator.generate('PRD')

  return {
    message: 'Success',
    data: code
  }
})

router.get('/run-product-factory', async () => {

  const product = await ProductFactory.createMany(50000)

  return {
    message: 'Success',
    data: product
  }
})

router.get('/flush-cache', async () => {

  const cacheManager = new CacheManager()

  const flush = await cacheManager.flushCache('product')

  return {
    message: 'Success',
    data: flush
  }
})


router.get('/product-without-cache', [ProductsController, 'getWithoutCache'])
router.get('/product-with-cache', [ProductsController, 'getWithCache'])
router.post('/product-with-cache', [ProductsController, 'storeWithCache'])

router.get('/transaction', [TransactionsController, 'index'])
router.post('/transaction', [TransactionsController, 'createTransaction'])
router.post('/transaction/:id/update-status', [TransactionsController, 'updateStatus'])