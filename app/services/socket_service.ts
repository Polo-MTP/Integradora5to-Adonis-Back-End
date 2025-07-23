import { Server as HttpServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import logger from '@adonisjs/core/services/logger'
import Tank from '#models/tank'
import auth from '@adonisjs/auth/services/main'

class SocketService {
  private io: SocketIOServer | null = null
  private authenticatedSockets = new Map<string, { userId: number; tankId?: number }>()

  public boot(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // En producción, especifica tu dominio
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    })

    this.io.on('connection', (socket: Socket) => {
      logger.info(`🔌 Nueva conexión Socket: ${socket.id}`)

      // Evento de autenticación
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          // Crear un contexto HTTP falso para la autenticación
          const fakeContext = {
            request: {
              header: () => `Bearer ${data.token}`
            }
          } as any

          const guard = auth.use('api')
          const user = await guard.authenticateUsing(['api'], fakeContext)
          
          if (user) {
            // Obtener el tanque del usuario
            const tank = await Tank.query().where('userId', user.id).first()
            
            this.authenticatedSockets.set(socket.id, { 
              userId: user.id, 
              tankId: tank?.id 
            })
            
            // Unir al room específico del tanque
            if (tank) {
              socket.join(`tank_${tank.id}`)
              logger.info(`✅ Usuario ${user.id} autenticado en tanque ${tank.id}`)
            }
            
            socket.emit('authenticated', { 
              success: true, 
              userId: user.id,
              tankId: tank?.id,
              tankName: tank?.name 
            })
          } else {
            socket.emit('authentication_failed', { message: 'Token inválido' })
          }
        } catch (error) {
          logger.error('Error en autenticación Socket:', error)
          socket.emit('authentication_failed', { message: 'Error de autenticación' })
        }
      })

      // Manejar desconexión
      socket.on('disconnect', () => {
        const userData = this.authenticatedSockets.get(socket.id)
        if (userData) {
          logger.info(`👋 Usuario ${userData.userId} desconectado`)
          this.authenticatedSockets.delete(socket.id)
        }
        logger.info(`🔌 Socket desconectado: ${socket.id}`)
      })

      // Solicitar datos históricos
      socket.on('request_historical_data', async (data: { sensor: string, limit?: number }) => {
        const userData = this.authenticatedSockets.get(socket.id)
        if (!userData?.tankId) {
          socket.emit('error', { message: 'No autenticado o sin tanque asignado' })
          return
        }

        try {
          // Aquí puedes implementar la lógica para obtener datos históricos
          socket.emit('historical_data', {
            sensor: data.sensor,
            data: [] // Aquí irían los datos históricos reales
          })
        } catch (error) {
          logger.error('Error obteniendo datos históricos:', error)
          socket.emit('error', { message: 'Error obteniendo datos históricos' })
        }
      })
    })

    logger.info('🚀 Socket.IO configurado correctamente')
  }

  // Método para emitir datos de sensores en tiempo real
  public emitSensorData(tankId: number, sensorData: {
    sensor: string
    value: number
    unit: string
    timestamp: string
    deviceId: number
    code: string
  }) {
    if (!this.io) return

    // Emitir a todos los usuarios conectados a este tanque específico
    this.io.to(`tank_${tankId}`).emit('sensor_data', sensorData)
    
    logger.info(`📊 Datos enviados al tanque ${tankId}:`, sensorData)
  }

  // Método para emitir alertas
  public emitAlert(tankId: number, alert: {
    type: 'warning' | 'error' | 'info'
    message: string
    sensor?: string
    value?: number
    timestamp: string
  }) {
    if (!this.io) return

    this.io.to(`tank_${tankId}`).emit('alert', alert)
    logger.warn(`🚨 Alerta enviada al tanque ${tankId}:`, alert)
  }

  // Obtener estadísticas de conexiones
  public getStats() {
    return {
      totalConnections: this.authenticatedSockets.size,
      authenticatedUsers: Array.from(this.authenticatedSockets.values())
    }
  }

  public getIO(): SocketIOServer | null {
    return this.io
  }
}

export default new SocketService()
