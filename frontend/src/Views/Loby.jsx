import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

export default function Lobby() {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const handleMatchFound = (data) => {
      if (data?.room) {
        setStatusMessage('Match found!');
        navigate(`/game/${data.room}`);
      }
    };

    const handleJoined = (data) => {
      if (data?.room) {
        setStatusMessage('Joined room successfully.');
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
    socket.on('joined', handleJoined);
    socket.on('error', handleError);
    socket.on('searching', handleSearching);

    return () => {
      socket.off('match-found', handleMatchFound);
      socket.off('joined', handleJoined);
      socket.off('error', handleError);
      socket.off('searching', handleSearching);
    };
  }, [navigate]);

  const joinRoom = () => {
    const roomName = roomInput.trim();
    if (!roomName) {
      setStatusMessage('Please enter a room ID.');
      return;
    }
    socket.emit('join_room', roomName);
  };

  return (
    <div className="min-h-screen bg-[#0a192f] p-10 flex flex-col items-center justify-center text-white">
      <h2 className="text-3xl font-bold mb-8">Battleship Lobby</h2>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={() => socket.emit('randomMatch')} className="p-4 bg-[#e63946] rounded-lg select-none cursor-pointer hover:shadow-2xl hover:scale-105">Random Match</button>
        <button onClick={() => {
          const id = `room_${Date.now()}`;
          socket.emit('join_room', id);
        }} className="p-4 bg-[#2a6f97] rounded-lg select-none cursor-pointer hover:shadow-2xl hover:scale-105">Create Private Room</button>

        <div className="flex gap-2 mt-4">
          <input className="p-2 rounded bg-gray-800 text-white w-full select-none" placeholder="Room ID" onChange={(e) => setRoomInput(e.target.value)} />
          <button onClick={joinRoom} className="p-2 select-none cursor-pointer hover:shadow-2xl hover:scale-105 bg-green-600 rounded">Join</button>
        </div>

        {statusMessage && <p className="text-sm text-center text-[#a8dadc]">{statusMessage}</p>}
      </div>
    </div>
  );
}