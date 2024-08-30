import app from '@adonisjs/core/services/app'
import ace from '@adonisjs/core/services/ace'

// we only want to start the queue:listen command in web environment
if (app.getEnvironment() === 'web') {

  // boot ace, if already running it will ignore
  await ace.boot()

  // start the queue:listen command

  const commandReminderPayment = await ace.exec('queue:listen', [
    '--queue=transaction_reminder_payment',
  ])

  const commandPaymentExpired = await ace.exec('queue:listen', [
    '--queue=transaction_payment_expired'
  ])

  // stop the queue:listen command when the app is terminating
  app.terminating(async () => {
    await commandReminderPayment.terminate()
    await commandPaymentExpired.terminate()
  })
}