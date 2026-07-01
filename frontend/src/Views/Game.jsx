import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

export default function Game() {
  const { roomId } = useParams();
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [myShips, setMyShips] = useState([]);
  const [myHits, setMyHits] = useState({});
  const [enemyHits, setEnemyHits] = useState({});
  const [statusMessage, setStatusMessage] = useState('Connecting to the room...');
  const [gameOver, setGameOver] = useState(false);
  const [winnerId, setWinnerId] = useState(null);

  useEffect(() => {
    if (!roomId) return undefined;

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
    };

    const handleOpponentDisconnected = () => {
      setGameOver(true);
      setStatusMessage('The opponent disconnected. You win by default.');
    };

    socket.emit('join_room', roomId);
    socket.emit('areYouReady', roomId);

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
  }, [roomId]);

  const handleAttack = (index) => {
    if (!isMyTurn || gameOver || enemyHits[index]) return;

    socket.emit('attack', { roomName: roomId, position: index });
    setStatusMessage('Attack sent. Waiting for the result...');
  };

  return (
    <div className="min-h-screen bg-[#080a10] text-white p-10 font-mono selection:bg-cyan-900/50">
      <div className={`mb-10 p-5 rounded-xl border-2 flex items-center justify-between shadow-2xl ${isMyTurn ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-700 bg-slate-900/30'} transition-all duration-500`}>
        <h1 className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-300 to-teal-400">
          NAVAL COMMAND CENTER
        </h1>
        <div className={`px-8 py-3 rounded-full font-bold text-xl ${isMyTurn && !gameOver ? 'bg-cyan-500 text-[#080a10]' : 'bg-slate-700 text-slate-300'}`}>
          {gameOver ? (winnerId === socket.id ? 'VICTORY' : 'DEFEAT') : isMyTurn ? 'YOUR TURN TO ATTACK' : 'ENEMY FIRING SEQUENCE...'}
        </div>
      </div>

      <div className="mb-6 text-center text-lg text-slate-300">{statusMessage}</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <section className="board-container flex flex-col items-center">
          <h2 className="text-3xl font-bold text-teal-300 mb-6 tracking-wide uppercase">Your Fleet Deployment</h2>
          <div className="grid grid-cols-10 gap-1 bg-[#0f172a] p-3 rounded-lg border-2 border-teal-900 shadow-inner ring-2 ring-slate-800">
            {[...Array(100)].map((_, i) => {
              const hasShip = myShips.includes(i);
              const gotHit = myHits[i] === 'hit';

              return (
                <div
                  key={i}
                  className={`w-12 h-12 border border-teal-900/50 flex items-center justify-center transition-colors duration-200 ${gotHit ? 'bg-red-950' : hasShip ? 'bg-teal-600' : 'bg-[#1e293b]'}`}
                >
                  {gotHit && <span className="text-red-400 text-3xl font-bold">X</span>}
                  {!gotHit && hasShip && <span className="block w-4 h-4 rounded-full bg-teal-200 shadow-lg"></span>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="board-container flex flex-col items-center">
          <h2 className="text-3xl font-bold text-red-400 mb-6 tracking-wide uppercase">Target Acquisition Grid</h2>
          <div className="grid grid-cols-10 gap-1 bg-[#0f172a] p-3 rounded-lg border-2 border-red-900/50 shadow-inner ring-2 ring-slate-800">
            {[...Array(100)].map((_, i) => {
              const hitStatus = enemyHits[i];

              return (
                <div
                  key={i}
                  onClick={() => handleAttack(i)}
                  className={`w-12 h-12 border border-red-900/50 flex items-center justify-center transition-all duration-300 ${!gameOver && isMyTurn && !enemyHits[i] ? 'cursor-pointer hover:bg-red-950 hover:border-red-600' : 'cursor-not-allowed'} ${hitStatus === 'hit' ? 'bg-red-700' : hitStatus === 'miss' ? 'bg-slate-600' : 'bg-[#1e293b]'}`}
                >
                  {hitStatus === 'hit' && <span className="text-white text-3xl font-bold">X</span>}
                  {hitStatus === 'miss' && <span className="block w-4 h-4 rounded-full bg-white shadow-lg"></span>}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="mt-12 p-5 bg-[#111827] rounded-lg border border-slate-700 flex justify-around text-slate-400">
        <span>Your Ships: <div className="inline-block w-4 h-4 rounded-full bg-teal-200 align-middle ml-2"></div></span>
        <span>Your Hits: <div className="inline-block w-4 h-4 bg-red-700 align-middle ml-2"></div> X</span>
        <span>Your Misses: <div className="inline-block w-4 h-4 rounded-full bg-white align-middle ml-2"></div></span>
      </footer>
    </div>
  );
}