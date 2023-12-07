import express, { Application } from 'express'
import http from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import cors from 'cors'

const app: Application = express()
const server: http.Server = http.createServer(app)
const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: '*',
    credentials: false
  }
})

app.use(cors())
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 4444

interface User {
  id: string
  name: string
  ipAddress: string
}

interface UsersMap {
  [key: string]: User[]
}

interface SocketToRoomMap {
  [key: string]: string
}

const users: UsersMap = {}
const socketToRoom: SocketToRoomMap = {}

const maximum: number = process.env.MAXIMUM ? parseInt(process.env.MAXIMUM, 10) : 10

io.on('connection', (socket: Socket) => {
  const rawIpAddress: string = socket.request.connection.remoteAddress || 'Unknown'
  const ipPattern = /(\d{1,3}\.){3}\d{1,3}/
  const ipAddress: string = rawIpAddress?.match(ipPattern)?.at(0) || 'localhost'

  socket.on('join_room', (data: { room: string; name: string }) => {
    if (users[data.room]) {
      const length: number = users[data.room].length
      if (length === maximum) {
        socket.to(socket.id).emit('room_full')
        return
      }
      users[data.room].push({
        id: socket.id,
        name: data.name,
        ipAddress: ipAddress
      })
    } else {
      users[data.room] = [{ id: socket.id, name: data.name, ipAddress: ipAddress }]
    }
    socketToRoom[socket.id] = data.room

    socket.join(data.room)
    const usersInThisRoom: User[] = users[data.room].filter((user) => user.id !== socket.id)

    console.log(users)

    io.sockets.to(socket.id).emit('all_users', usersInThisRoom)
  })

  socket.on(
    'offer',
    (data: { sdp: string; offerReceiveID: string; offerSendID: string; offerSendName: string }) => {
      socket.to(data.offerReceiveID).emit('getOffer', {
        sdp: data.sdp,
        offerSendID: data.offerSendID,
        offerSendName: data.offerSendName
      })
    }
  )

  socket.on('answer', (data: { sdp: string; answerReceiveID: string; answerSendID: string }) => {
    socket
      .to(data.answerReceiveID)
      .emit('getAnswer', { sdp: data.sdp, answerSendID: data.answerSendID })
  })

  socket.on(
    'candidate',
    (data: { candidate: string; candidateReceiveID: string; candidateSendID: string }) => {
      socket
        .to(data.candidateReceiveID)
        .emit('getCandidate', { candidate: data.candidate, candidateSendID: data.candidateSendID })
    }
  )

  socket.on('disconnect', () => {
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`)
    const roomID: string = socketToRoom[socket.id]
    let room: User[] | undefined = users[roomID]
    if (room) {
      room = room.filter((user) => user.id !== socket.id)
      users[roomID] = room
      if (room.length === 0) {
        delete users[roomID]
        return
      }
    }
    socket.to(roomID).emit('user_exit', { id: socket.id })
    console.log(users)
  })
})

server.listen(PORT, () => {
  console.log(`server running on ${PORT}`)
})
