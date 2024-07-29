import redis from '@adonisjs/redis/services/main'

export class CodeAllocator {

    public static async generate (type: string): Promise<string | false> {

        if (!type) {
            return false
        }

        const increment = (await redis.incr(`CODEALLOCATOR-${type}`)).toString()

        let zeroPadding = "000000000"

        let allocator: string = type.concat('-')
            .concat(zeroPadding.substr(0, zeroPadding.length - increment.toString().length))
            .concat(increment)

        return allocator
    }
}