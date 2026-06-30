import React, { useEffect, useState } from 'react'

export default function Header({ onOpenHistory }) {
    const [activeUser, setActiveUser] = useState(() => {
        try {
            return localStorage.getItem('activeUser') || ''
        } catch (e) {
            return ''
        }
    })
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [inputName, setInputName] = useState('')

    useEffect(() => {
        try {
            if (activeUser) localStorage.setItem('activeUser', activeUser)
        } catch (e) { }
    }, [activeUser])

    const handleRegister = () => {
        const name = inputName.trim()
        if (!name) return

        let list = []
        try {
            const raw = localStorage.getItem('registeredNames')
            list = raw ? JSON.parse(raw) : []
        } catch (e) {
            list = []
        }

        let finalName = name
        while (list.includes(finalName)) {
            const suffix = Math.floor(1000 + Math.random() * 9000) // 4-digit
            finalName = `${name}-${suffix}`
        }

        list.push(finalName)
        try {
            localStorage.setItem('registeredNames', JSON.stringify(list))
            localStorage.setItem('activeUser', finalName)
        } catch (e) { }

        setActiveUser(finalName)
        setShowRegisterModal(false)
        setInputName('')
    }

    return (
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-5 bg-[#0a192f]/80 backdrop-blur-md border-b border-[#233554]">
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#e63946] rounded-full animate-pulse shadow-[0_0_10px_#e63946]"></div>
                <h1 className="text-2xl font-black text-[#f1faee] tracking-[0.2em] uppercase">
                    Battle<span className="text-[#e63946]">ship</span>
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => onOpenHistory && onOpenHistory(activeUser)}
                    className="bg-[#233554] cursor-pointer text-[#a8dadc] px-4 py-2 rounded-md hover:bg-[#a8dadc] hover:text-[#0a192f] transition"
                >
                    View History
                </button>

                {/* Register button - hidden if activeUser exists */}
                {!activeUser && (
                    <button onClick={() => setShowRegisterModal(true)} className="bg-[#2a6f97] cursor-pointer text-[#f1faee] px-4 py-2 rounded-md hover:opacity-90 transition">
                        Register Name
                    </button>
                )}

                {activeUser && (
                    <button title={`Registered: ${activeUser}`} className="text-yellow-300 px-3 py-2 rounded-md">★</button>
                )}
            </div>

            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a192f]/70 backdrop-blur-sm">
                    <div className="w-96 bg-[#0a192f] border border-[#233554] rounded-xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#f1faee]">Register Name</h3>
                            <button onClick={() => setShowRegisterModal(false)} className="text-[#e63946] font-bold">X</button>
                        </div>

                        <input
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full mb-4 px-3 py-2 rounded bg-[#233554] text-[#a8dadc]"
                        />

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowRegisterModal(false)} className="px-4 py-2 rounded bg-[#444] text-[#f1faee]">Cancel</button>
                            <button onClick={handleRegister} className="px-4 py-2 rounded bg-[#e63946] text-white">Register</button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}