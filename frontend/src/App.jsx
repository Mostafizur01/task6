import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import Home from './Views/Home'
import Loby from './Views/Loby'
import Game from './Views/Game'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/Loby' element={<Loby/>}/>
          <Route path='/game/:roomId' element={<Game/>}/>
        </Routes>
      </BrowserRouter>      
    </>
  )
}


