import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'

const io = new Server(server.getNodeServer(), {
  cors: {
    origin: '*', // Cambia esto en producción
  },
})

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`)

  socket.on('message', (data) => {
    console.log('Mensaje:', data)
    io.emit('message', data) // Envia a todos los clientes
  })

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`)
  })
})

console.log('Socket.IO iniciado')
