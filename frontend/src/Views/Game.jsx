import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

export default function Game() {
  const { roomId } = useParams();
  const resolvedRoomId = typeof roomId === 'string' ? roomId.trim() : '';
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [myShips, setMyShips] = useState([]);
  const [myHits, setMyHits] = useState({});
  const [enemyHits, setEnemyHits] = useState({});
  const [statusMessage, setStatusMessage] = useState('Connecting to the room...');
  const [gameOver, setGameOver] = useState(false);
  const [winnerId, setWinnerId] = useState(null);

  useEffect(() => {
    if (!resolvedRoomId) {
      setStatusMessage('Missing room ID.');
      return undefined;
    }

    const handleStartGame = (data) => {
      setMyShips(data.myShips || []);
      setIsMyTurn(data.turn === socket.id);
      setStatusMessage(data.turn === socket.id ? 'Your turn to attack.' : 'Waiting for the opponent.');
    };

    const handleAttackResult = (data) => {
      if (data.attackerId === socket.id) {
        setEnemyHits((prev) => ({ ...prev, [data.position]: data.result }));
      } else {
        setMyHits((prev) => ({ ...prev, [data.position]: data.result }));
      }

      setIsMyTurn(data.turn === socket.id);
      setStatusMessage(data.result === 'hit' ? 'Direct hit!' : 'Missed the target.');
    };

    const handleGameOver = (data) => {
      setGameOver(true);
      setWinnerId(data.winnerId || null);
      setStatusMessage(data.winnerId === socket.id ? 'You won the battle!' : 'You lost this round.');
      setTimeout(() => {
        navigate('/lobby');
      }, 5000);
    };

    const handleOpponentDisconnected = () => {
      setGameOver(true);
      setStatusMessage('The opponent disconnected. You win by default.');
      setTimeout(() => {
        navigate('/lobby');
      }, 5000);
    };

    socket.emit('join_room', resolvedRoomId);
    socket.emit('areYouReady', resolvedRoomId);

    socket.on('startGame', handleStartGame);
    socket.on('attackResult', handleAttackResult);
    socket.on('gameOver', handleGameOver);
    socket.on('opponentDisconnected', handleOpponentDisconnected);

    return () => {
      socket.off('startGame', handleStartGame);
      socket.off('attackResult', handleAttackResult);
      socket.off('gameOver', handleGameOver);
      socket.off('opponentDisconnected', handleOpponentDisconnected);
    };
  }, [resolvedRoomId]);

  const handleAttack = (index) => {
    if (!isMyTurn || gameOver || enemyHits[index]) return;

    socket.emit('attack', { roomName: resolvedRoomId, position: index });
    setStatusMessage('Attack sent. Waiting for the result...');
  };

  return (
    <div className="min-h-screen bg-[#080a10] text-white p-4 sm:p-10 font-mono selection:bg-cyan-900/50">
      <div className={`mb-6 sm:mb-10 p-4 sm:p-5 rounded-xl border-2 flex flex-col sm:flex-row items-center justify-between shadow-2xl ${isMyTurn ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-700 bg-slate-900/30'} transition-all duration-500`}>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400">
          NAVAL COMMAND
        </h1>
        <div className={`mt-4 sm:mt-0 px-6 py-2 rounded-full font-bold text-sm sm:text-xl ${isMyTurn && !gameOver ? 'bg-cyan-500 text-[#080a10]' : 'bg-slate-700 text-slate-300'}`}>
          {gameOver ? (winnerId === socket.id ? 'VICTORY' : 'DEFEAT') : isMyTurn ? 'YOUR TURN' : 'ENEMY FIRING...'}
        </div>
      </div>

      <div className="mb-6 text-center text-md sm:text-lg text-slate-300">{statusMessage}</div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-16">

        <section className="flex flex-col items-center">
          <h2 className="text-xl sm:text-3xl font-bold text-teal-300 mb-4 uppercase">Your Fleet</h2>
          <div className="grid grid-cols-10 gap-0.5 sm:gap-1 bg-[#0f172a] p-1 sm:p-3 rounded-lg border-2 border-teal-900">
            {[...Array(100)].map((_, i) => (
              <div key={i} className={`w-[28px] h-[28px] sm:w-10 sm:h-10 border border-teal-900/50 flex items-center justify-center ${myHits[i] === 'hit' ? 'bg-red-950' : myShips.includes(i) ? 'bg-teal-600' : 'bg-[#1e293b]'}`}>
                {myHits[i] === 'hit' && <span className="text-red-400 text-xs sm:text-2xl font-bold">X</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center">
          <h2 className="text-xl sm:text-3xl font-bold text-red-400 mb-4 uppercase">Target Acquisition</h2>
          <div className="grid grid-cols-10 gap-0.5 sm:gap-1 bg-[#0f172a] p-1 sm:p-3 rounded-lg border-2 border-red-900/50">
            {[...Array(100)].map((_, i) => (
              <div key={i} onClick={() => handleAttack(i)} className={`w-[28px] h-[28px] sm:w-10 sm:h-10 border border-red-900/50 flex items-center justify-center ${!gameOver && isMyTurn && !enemyHits[i] ? 'cursor-pointer hover:bg-red-950' : 'cursor-not-allowed'} ${enemyHits[i] === 'hit' ? 'bg-red-700' : enemyHits[i] === 'miss' ? 'bg-slate-600' : 'bg-[#1e293b]'}`}>
                {enemyHits[i] === 'hit' && <span className="text-white text-xs sm:text-2xl font-bold">X</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}