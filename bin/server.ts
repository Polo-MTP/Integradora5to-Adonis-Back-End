import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

const APP_ROOT = new URL('../', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env') // Carga variables del .env
      await import('../start/mongo.js') // Conecta a MongoDB Atlas
    })

    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()
  .start()
  .then((httpServer) => {
    // Inicializar Socket.IO después de que el servidor HTTP esté listo
    import('../app/services/socket_service.js')
      .then((module) => {
        module.default.boot(httpServer)
      })
      .catch((error) => {
        console.error('Error inicializando Socket.IO:', error)
      })
  })
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
