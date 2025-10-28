import React from 'react'
import { Link } from 'react-router'

const SideBarListItem = ({children, to, className}) => {
  return (
    <Link to={to} className={'sideBarListItem relative z-[0] flex flex-wrap items-center gap-x-4 px-3 py-2  rounded-[10px] border border-transparent '+" " + className}>{children}</Link>
  )
}

export default SideBarListItem