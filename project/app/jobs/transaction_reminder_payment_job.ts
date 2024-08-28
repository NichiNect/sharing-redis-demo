import Notification from '#models/notification'
import Transaction from '#models/transaction'
import { Job } from '@rlanz/bull-queue'

interface TransactionReminderPaymentJobPayload {
    transactionId: number
}

export default class TransactionReminderPaymentJob extends Job {

    // This is the path to the file that is used to create the job
    static get $$filepath() {
        return import.meta.url
    }

    /**
     * Base Entry point
     */
    async handle(payload: TransactionReminderPaymentJobPayload) {

        const transaction = await Transaction.find(payload.transactionId)

        if (transaction) {

            if (transaction.status == 'waiting_payment') {

                // * Set notif
                await Notification.create({
                    user_id: transaction.user_id,
                    transaction_id: transaction.id,
                    message: `Segera selesaikan pembayaran kamu sebelum batas waktu kadaluarsa ${transaction.expired_payment.toFormat('yyyy LLL dd, HH:mm:ss')}`
                })
            }
        }
    }

    /**
     * This is an optional method that gets called when the retries has exceeded and is marked failed.
     */
    async rescue(_payload: TransactionReminderPaymentJobPayload) {}
}