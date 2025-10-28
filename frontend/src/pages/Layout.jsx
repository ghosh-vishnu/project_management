import React from 'react'
import Sidebar from '../components/SideBar'
import { Outlet } from 'react-router'

const Layout = () => {
  return (
    <div >
        <Sidebar>
            <Outlet/>
        </Sidebar>
    </div>
  )
}

export default Layout;