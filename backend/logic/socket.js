const rooms = {}
const queue = []

export default (io) => {
    io.on('connection', (socket) => {
        socket.on('jone_room', (roomName) => {
            const room = io.sockets.adapter.rooms.get(roomName)
            const totalPlyers = room ? room.size : 0

            if (totalPlyers < 2) {
                socket.join(roomName)
                if (!rooms[roomName]) {
                    rooms[roomName] = {
                        players: [],
                        turn: null,
                        count: 0
                    }
                }
                rooms[roomName].players.push(socket.id)
                socket.emit('joined', { message: 'you joined room', room: roomName })
            } else {
                socket.emit('error', 'the room is full')
            }

        })
        socket.on('randomMatch', () => {
            if (queue.includes(socket.id)) return;

            if (queue.length > 0) {
                const opponentSocketId = queue.shift()
                const opponentSocket = io.sockets.sockets.get(opponentSocketId);

                if (opponentSocket && opponentSocket.connected) {
                    const roomName = `room_${Date.now()}`
                    
                    socket.join(roomName)
                    opponentSocket.join(roomName)

                    rooms[roomName] = { 
                        players: [opponentSocketId, socket.id], 
                        turn: null, 
                        count: 0,
                        playersReady: [] 
                    };

                    io.to(roomName).emit('match-found', { room: roomName })
                } else {
                    queue.push(socket.id)
                    socket.emit('searching', 'Waiting for opponent...')
                }
            } else {
                queue.push(socket.id)
                socket.emit('searching', 'Waiting for opponent...')
            }
        })
        socket.on('areYouReady', (roomName) => {
            const room = rooms[roomName];
            if (!room) return;

            if (!room.playersReady) room.playersReady = [];
            if (room.playersReady.includes(socket.id)) return;

            room.playersReady.push(socket.id);
            room.count += 1;

            if (room.count === 2) {
                room.turn = room.players[0];
                io.to(roomName).emit('startGame', { turn: room.turn });
            }
        })

        socket.on('attack', ({ roomName, row, col }) => {
            const room = rooms[roomName]
            if (!room || room.turn !== socket.id) return
            room.turn = room.players.find(id => id !== socket.id)
            socket.to(roomName).emit('attackKorece', { row, col })
            io.to(roomName).emit('porerJon', { nextTurn: room.turn })
        })

        socket.on('disconnect', () => {
            const queueIndex = queue.indexOf(socket.id)
            if (queueIndex !== -1) {
                queue.splice(queueIndex, 1)
            }
            for (const roomName in rooms) {
                if (rooms[roomName].players.includes(socket.id)) {
                    io.to(roomName).emit('opponentDisconnected', 'Opponent left the game')
                    delete rooms[roomName]
                }
            }
        })
    })
}