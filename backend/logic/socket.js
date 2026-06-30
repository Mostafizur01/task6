const rooms = {};
const queue = [];

const getOrCreateRoom = (roomName) => {
    if (!rooms[roomName]) {
        rooms[roomName] = {
            players: [],
            turn: null,
            count: 0,
            playersReady: [],
        };
    }
    return rooms[roomName];
};

export default (io) => {
    io.on('connection', (socket) => {
        const joinRoom = (roomName) => {
            if (!roomName || typeof roomName !== 'string') {
                socket.emit('error', 'Invalid room name');
                return;
            }

            const room = getOrCreateRoom(roomName);
            const currentRoom = io.sockets.adapter.rooms.get(roomName);
            const currentSize = currentRoom ? currentRoom.size : 0;

            if (currentSize >= 2 || room.players.includes(socket.id)) {
                if (room.players.includes(socket.id)) {
                    socket.emit('joined', { message: 'You already joined this room', room: roomName });
                } else {
                    socket.emit('error', 'the room is full');
                }
                return;
            }

            socket.join(roomName);
            if (!room.players.includes(socket.id)) {
                room.players.push(socket.id);
            }
            socket.emit('joined', { message: 'you joined room', room: roomName });
        };

        socket.on('jone_room', joinRoom);
        socket.on('join_room', joinRoom);

        socket.on('randomMatch', () => {
            if (queue.includes(socket.id)) return;

            if (queue.length > 0) {
                const opponentSocketId = queue.shift();
                const opponentSocket = io.sockets.sockets.get(opponentSocketId);

                if (opponentSocket && opponentSocket.connected) {
                    const roomName = `room_${Date.now()}`;

                    socket.join(roomName);
                    opponentSocket.join(roomName);

                    rooms[roomName] = {
                        players: [opponentSocketId, socket.id],
                        turn: null,
                        count: 0,
                        playersReady: [],
                    };

                    io.to(roomName).emit('match-found', { room: roomName });
                } else {
                    queue.push(socket.id);
                    socket.emit('searching', 'Waiting for opponent...');
                }
            } else {
                queue.push(socket.id);
                socket.emit('searching', 'Waiting for opponent...');
            }
        });

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
        });

        socket.on('attack', ({ roomName, row, col }) => {
            const room = rooms[roomName];
            if (!room || room.turn !== socket.id) return;
            room.turn = room.players.find((id) => id !== socket.id) || null;
            socket.to(roomName).emit('attackKorece', { row, col });
            io.to(roomName).emit('porerJon', { nextTurn: room.turn });
        });

        socket.on('disconnect', () => {
            const queueIndex = queue.indexOf(socket.id);
            if (queueIndex !== -1) {
                queue.splice(queueIndex, 1);
            }

            Object.keys(rooms).forEach((roomName) => {
                if (rooms[roomName].players.includes(socket.id)) {
                    io.to(roomName).emit('opponentDisconnected', 'Opponent left the game');
                    delete rooms[roomName];
                }
            });
        });
    });
};