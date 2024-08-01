module.exports = {
    apps: [
        {
            name: 'Queue-TransactionReminderPayment',
            port: 3101,
            script: 'node ace queue:listen --queue=transaction_reminder_payment',
            watch: 'false'
        },
        {
            name: 'Queue-TransactionPaymentExpired',
            port: 3102,
            script: 'node ace queue:listen --queue=transaction_payment_expired',
            watch: 'false'
        },
    ],
}