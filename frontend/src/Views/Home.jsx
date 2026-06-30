import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import History from './History';

const API_BASE_URL = 'https://task6-backend-v424.onrender.com';

export default function Home() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const fetchHistory = async () => {
    try {
      const userName = localStorage.getItem('activeUser') || '';
      if (!userName) {
        setHistoryData([
          { result: 'Win', count: 0 },
          { result: 'Lose', count: 0 },
          { result: 'Total Played', count: 0 },
        ]);
        setIsModalOpen(true);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/history/history/${encodeURIComponent(userName)}`);
      if (!response.ok) throw new Error('Data not found');

      const data = await response.json();
      setHistoryData([
        { result: 'Win', count: data.win },
        { result: 'Lose', count: data.lose },
        { result: 'Total Played', count: data.gamePlay },
      ]);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error:', error);
      setHistoryData([
        { result: 'Win', count: 0 },
        { result: 'Lose', count: 0 },
        { result: 'Total Played', count: 0 },
      ]);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center">
      <Header onOpenHistory={fetchHistory} />

      <button
        onClick={() => navigate('/Loby')}
        className="group cursor-pointer relative px-12 py-5 bg-transparent border-2 border-[#e63946] text-[#e63946] font-bold text-lg uppercase tracking-widest transition-all duration-300 hover:bg-[#e63946] hover:text-[#f1faee] hover:shadow-[0_0_30px_rgba(230,57,70,0.4)]"
      >
        Start
      </button>

      <History isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} historyData={historyData} />
    </div>
  );
}