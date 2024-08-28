import factory from '@adonisjs/lucid/factories'
import Product from '#models/product'
import stringHelpers from '@adonisjs/core/helpers/string'
import { CodeAllocator } from '../../app/helpers/code_allocator.js'

export const ProductFactory = factory
  .define(Product, async ({ faker }) => {

    const productName = faker.commerce.productName()
    const slug = stringHelpers.slug(productName)
    const code = await CodeAllocator.generate('PRD') || ''

    return {
      name: productName,
      slug,
      code: code,
      description: faker.commerce.productDescription(),
      price: parseInt(faker.commerce.price({ min: 1000, dec: 0 })),
      is_active: true
    }
  })
  .build()