const rooms = {};
const queue = [];

const getOrCreateRoom = (roomName) => {
    if (!rooms[roomName]) {
        rooms[roomName] = {
            players: [],
            turn: null,
            playersReady: [],
            ships: {},
            hitCounts: {},
            started: false,
            gameOver: false,
        };
    }
    return rooms[roomName];
};

const generateShips = () => {
    const positions = new Set();
    while (positions.size < 5) {
        positions.add(Math.floor(Math.random() * 100));
    }
    return Array.from(positions);
};

const removeFromQueue = (socketId) => {
    const index = queue.indexOf(socketId);
    if (index >= 0) {
        queue.splice(index, 1);
    }
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

            if (room.gameOver) {
                socket.emit('error', 'This room has already finished.');
                return;
            }

            if (currentSize >= 2 || room.players.includes(socket.id)) {
                if (room.players.includes(socket.id)) {
                    socket.emit('joined', { message: 'You already joined this room', room: roomName });
                } else {
                    socket.emit('error', 'the room is full');
                }
                return;
            }

            socket.join(roomName);
            socket.data.roomName = roomName;
            if (!room.players.includes(socket.id)) {
                room.players.push(socket.id);
            }
            socket.emit('joined', { message: 'you joined room', room: roomName });
        };

        socket.on('jone_room', joinRoom);
        socket.on('join_room', joinRoom);

        socket.on('randomMatch', () => {
            removeFromQueue(socket.id);

            if (queue.length > 0) {
                const opponentSocketId = queue.shift();
                const opponentSocket = io.sockets.sockets.get(opponentSocketId);

                if (opponentSocket && opponentSocket.connected) {
                    const roomName = `room_${Date.now()}`;

                    socket.join(roomName);
                    opponentSocket.join(roomName);
                    socket.data.roomName = roomName;
                    opponentSocket.data.roomName = roomName;

                    rooms[roomName] = {
                        players: [opponentSocketId, socket.id],
                        turn: null,
                        playersReady: [],
                        ships: {},
                        hitCounts: {},
                        started: false,
                        gameOver: false,
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
            if (!room || room.gameOver) return;

            if (!room.playersReady) room.playersReady = [];
            if (room.playersReady.includes(socket.id)) return;

            room.playersReady.push(socket.id);

            if (room.playersReady.length === 2) {
                room.started = true;
                room.turn = room.players[0];
                room.hitCounts = {};
                room.ships = {};

                room.players.forEach((playerId) => {
                    room.ships[playerId] = generateShips();
                    room.hitCounts[playerId] = 0;
                });

                room.players.forEach((playerId) => {
                    io.to(playerId).emit('startGame', {
                        room: roomName,
                        turn: room.turn,
                        myShips: room.ships[playerId],
                    });
                });
            }
        });

        socket.on('attack', ({ roomName, position, row, col }) => {
            const room = rooms[roomName];
            if (!room || room.gameOver || !room.started || room.turn !== socket.id) return;

            const parsedPosition = typeof position === 'number'
                ? position
                : (typeof row === 'number' && typeof col === 'number' ? row * 10 + col : null);

            if (parsedPosition === null || parsedPosition < 0 || parsedPosition > 99) return;

            const defenderId = room.players.find((playerId) => playerId !== socket.id);
            if (!defenderId) return;

            const defenderShips = room.ships[defenderId] || [];
            const isHit = defenderShips.includes(parsedPosition);
            room.hitCounts[defenderId] = (room.hitCounts[defenderId] || 0) + (isHit ? 1 : 0);
            room.turn = defenderId;

            io.to(roomName).emit('attackResult', {
                room: roomName,
                position: parsedPosition,
                result: isHit ? 'hit' : 'miss',
                attackerId: socket.id,
                defenderId,
                turn: room.turn,
            });

            if (room.hitCounts[defenderId] >= 5) {
                room.gameOver = true;
                io.to(roomName).emit('gameOver', {
                    room: roomName,
                    winnerId: socket.id,
                });
                delete rooms[roomName];
            }
        });

        socket.on('disconnect', () => {
            removeFromQueue(socket.id);

            const roomName = socket.data?.roomName;
            if (!roomName) return;

            const room = rooms[roomName];
            if (!room) return;

            room.players = room.players.filter((playerId) => playerId !== socket.id);

            if (room.players.length === 0) {
                delete rooms[roomName];
            } else {
                io.to(room.players[0]).emit('opponentDisconnected', { room: roomName });
                delete rooms[roomName];
            }
        });
    });
};