import React from 'react'

export default function History({ isOpen, onClose, historyData }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a192f]/70 backdrop-blur-sm">
      <div className="w-[400px] bg-[#0a192f] border border-[#233554] rounded-xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#f1faee] tracking-widest uppercase">Statistics</h2>
          <button onClick={onClose} className="text-[#e63946] font-bold">X</button>
        </div>

        <div className="space-y-3">
          {historyData.map((item, index) => (
            <div key={index} className="flex justify-between p-3 bg-[#233554]/30 rounded-md">
              <span className="text-[#a8dadc]">{item.result}</span>
              <span className="font-bold text-[#f1faee]">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}