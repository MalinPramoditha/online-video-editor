import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'


export default function RootLayout({ children }) {
  return (
    <div className='flex h-screen w-full'>
        <Sidebar/>
        <div className='w-full'>
       <Header/>
        {children}
        </div>
    </div>
  )
}
