
import redis from '@adonisjs/redis/services/main'

type IParams = {
    page: number,
    limit: number
    search: string,
}

type IGetOptions = {
    params: IParams,
    mode?: 'single' | 'multiple'
}

export class CacheManager {

    public async get(resource: string, options: IGetOptions): Promise<any> {

        if (!resource) {
            return false
        }

        if (!options.mode) {
            options.mode = 'multiple'
        }

        // example: multiple:product:{search:electric,page:1,limit:10}

        const paramsToString = JSON.stringify(options.params)

        let key: string = options.mode.concat(':')
            .concat(resource)
            .concat(':')
            .concat(paramsToString)

        const cache = await redis.get(key)

        if (cache) {
            return JSON.parse(cache)
        }

        return cache
    }

    public async set(resource: string, options: IGetOptions, data: any): Promise<any> {

        if (!resource) {
            return false
        }

        if (!options.mode) {
            options.mode = 'multiple'
        }

        const paramsToString = JSON.stringify(options.params)

        let key: string = options.mode.concat(':')
            .concat(resource)
            .concat(':')
            .concat(paramsToString)

        const parsedData = JSON.stringify(data)

        const createCache = await redis.set(key, parsedData, 'EX', 60)

        return createCache
    }

    public async flushCache(resource: string = ''): Promise<any> {

        const cacheKeyMultiple = await redis.keys(`multiple:${resource}*`)
        if (cacheKeyMultiple?.length > 0) {
            await redis.del(cacheKeyMultiple)
        }

        const cacheKeySingle = await redis.keys(`single:${resource}*`)
        if (cacheKeySingle?.length > 0) {
            await redis.del(cacheKeySingle)
        }

        return {
            multiple: cacheKeyMultiple,
            single: cacheKeySingle
        }
    }
}