import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

export default function Game() {
  const { roomId } = useParams();
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socket.emit('jone_room', roomId);
    socket.emit('areYouReady', roomId);

    socket.on('startGame', (data) => {
      setGameStarted(true);
      setIsMyTurn(data.turn === socket.id);
    });

    socket.on('porerJon', ({ nextTurn }) => setIsMyTurn(nextTurn === socket.id));
    socket.on('attackKorece', ({ row, col }) => console.log("Opponent hit:", row, col));
    
    return () => socket.off();
  }, [roomId]);

  const handleAttack = (row, col) => {
    if (!isMyTurn) return;
    socket.emit('attack', { roomName: roomId, row, col });
    setIsMyTurn(false);
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center text-white">
      <h2 className="mb-4">Room: {roomId}</h2>
      {gameStarted ? (
        <div className="grid grid-cols-10 border border-gray-700">
          {[...Array(100)].map((_, i) => (
            <div key={i} onClick={() => handleAttack(Math.floor(i/10), i%10)} 
                 className="w-8 h-8 bg-blue-900 border border-gray-700 cursor-pointer" />
          ))}
        </div>
      ) : <p>Waiting for opponent...</p>}
      <p className="mt-4 font-bold">{isMyTurn ? "Your Turn" : "Opponent's Turn"}</p>
    </div>
  );
}