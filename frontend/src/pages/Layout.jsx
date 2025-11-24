import React from 'react'
import Sidebar from '../components/SideBar'
import { Outlet } from 'react-router'

const Layout = () => {
  return (
    <div>
        <Sidebar>
            <div style={{ width: '100%', minHeight: '100vh' }}>
              <Outlet/>
            </div>
        </Sidebar>
    </div>
  )
}

export default Layout;