// ! Unused anymore. move to start/queue.ts and registered to adonisrc.ts file

module.exports = {
    apps: [
        {
            name: 'Queue-TransactionReminderPayment',
            port: 3101,
            // script: 'node ace queue:listen --queue=transaction_reminder_payment',
            script: './build/bin/console.js',
            args: ['queue:listen', '--queue=transaction_reminder_payment'],
            watch: 'false'
        },
        {
            name: 'Queue-TransactionPaymentExpired',
            port: 3102,
            // script: 'node ace queue:listen --queue=transaction_payment_expired',
            script: './build/bin/console.js',
            args: ['queue:listen', '--queue=transaction_payment_expired'],
            watch: 'false'
        },
    ],
}