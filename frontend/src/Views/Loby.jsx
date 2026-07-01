import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

export default function Lobby() {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const handleMatchFound = (data) => {
      if (data?.room) {
        setStatusMessage('Match found!');
        navigate(`/game/${data.room}`);
      }
    };

    const handleError = (err) => {
      setStatusMessage(err || 'Something went wrong.');
    };

    const handleSearching = (message) => {
      setStatusMessage(message || 'Searching for an opponent...');
    };

    socket.on('match-found', handleMatchFound);
    socket.on('error', handleError);
    socket.on('searching', handleSearching);

    return () => {
      socket.off('match-found', handleMatchFound);
      socket.off('error', handleError);
      socket.off('searching', handleSearching);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a192f] p-10 flex flex-col items-center justify-center text-white">
      <h2 className="text-3xl font-bold mb-8">Battleship Lobby</h2>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={() => socket.emit('randomMatch')} className="p-4 bg-[#e63946] rounded-lg select-none cursor-pointer hover:shadow-2xl hover:scale-105">Random Match</button>

        {statusMessage && <p className="text-sm text-center text-[#a8dadc]">{statusMessage}</p>}
      </div>
    </div>
  );
}