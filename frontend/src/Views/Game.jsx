import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

export default function Game() {
  const { roomId } = useParams();
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Waiting for the other player...');

  useEffect(() => {
    if (!roomId) return undefined;

    const handleStartGame = (data) => {
      setGameStarted(true);
      setIsMyTurn(data.turn === socket.id);
      setStatusMessage(data.turn === socket.id ? 'Your turn to attack.' : 'Opponent turn.');
    };

    const handleTurnUpdate = ({ nextTurn }) => {
      const myTurn = nextTurn === socket.id;
      setIsMyTurn(myTurn);
      setStatusMessage(myTurn ? 'Your turn to attack.' : "Opponent's turn.");
    };

    const handleIncomingAttack = ({ row, col }) => {
      setStatusMessage(`Opponent attacked row ${row + 1}, col ${col + 1}.`);
    };

    const handleError = (error) => {
      setStatusMessage(error || 'An error occurred.');
    };

    const handleOpponentDisconnected = () => {
      setGameStarted(false);
      setStatusMessage('The opponent disconnected.');
    };

    socket.emit('join_room', roomId);
    socket.emit('areYouReady', roomId);

    socket.on('startGame', handleStartGame);
    socket.on('porerJon', handleTurnUpdate);
    socket.on('attackKorece', handleIncomingAttack);
    socket.on('error', handleError);
    socket.on('opponentDisconnected', handleOpponentDisconnected);

    return () => {
      socket.off('startGame', handleStartGame);
      socket.off('porerJon', handleTurnUpdate);
      socket.off('attackKorece', handleIncomingAttack);
      socket.off('error', handleError);
      socket.off('opponentDisconnected', handleOpponentDisconnected);
    };
  }, [roomId]);

  const handleAttack = (row, col) => {
    if (!gameStarted || !isMyTurn) return;
    socket.emit('attack', { roomName: roomId, row, col });
    setIsMyTurn(false);
    setStatusMessage('Attack sent.');
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center text-white px-4">
      <h2 className="mb-4">Room: {roomId}</h2>
      {gameStarted ? (
        <div className="grid grid-cols-10 border border-gray-700">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              onClick={() => handleAttack(Math.floor(i / 10), i % 10)}
              className="w-8 h-8 bg-blue-900 border border-gray-700 cursor-pointer"
            />
          ))}
        </div>
      ) : (
        <p>{statusMessage}</p>
      )}
      <p className="mt-4 font-bold">{isMyTurn ? "Your Turn" : "Opponent's Turn"}</p>
      <p className="mt-2 text-sm text-[#a8dadc]">{statusMessage}</p>
    </div>
  );
}