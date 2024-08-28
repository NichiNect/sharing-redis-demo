import Notification from '#models/notification'
import Transaction from '#models/transaction'
import { Job } from '@rlanz/bull-queue'
import { DateTime } from 'luxon'

interface TransactionPaymentExpiredJobPayload {
    transactionId: number
}

export default class TransactionPaymentExpiredJob extends Job {

    // This is the path to the file that is used to create the job
    static get $$filepath() {
        return import.meta.url
    }

    /**
     * Base Entry point
     */
    async handle(payload: TransactionPaymentExpiredJobPayload) {

        const transaction = await Transaction.find(payload.transactionId)

        if (transaction) {

            if (transaction.status == 'waiting_payment' && transaction.expired_payment < DateTime.now()) {

                // * Set status transaction to `cancel
                transaction.status = 'cancel'
                await transaction.save()

                // * Set notif
                await Notification.create({
                    user_id: transaction.user_id,
                    transaction_id: transaction.id,
                    message: `Transaksi ${transaction.transaction_number} telah dibatalkan karena pembayaran telah kadaluarsa`
                })
            }
        }
    }

    /**
     * This is an optional method that gets called when the retries has exceeded and is marked failed.
     */
    async rescue(_payload: TransactionPaymentExpiredJobPayload) {}
}