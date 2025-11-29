import React from 'react'
import Sidebar from '../components/SideBar'
import { Outlet } from 'react-router'

const Layout = () => {
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
        <Sidebar>
            <div style={{ width: '100%', height: '100vh', overflowX: 'hidden', overflowY: 'auto', position: 'relative' }}>
              <Outlet/>
            </div>
        </Sidebar>
    </div>
  )
}

export default Layout;