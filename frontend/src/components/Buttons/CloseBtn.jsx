import React from 'react'
import { Link } from 'react-router'

const CloseBtn = ({to, className, children, type, onClick}) => {
  return (
    <Link to = {to}>
        <button onClick={onClick} type={type} className={'px-4 py-2 rounded-[5px] cursor-pointer transition-all hover:shadow-[2px_2px_5px] hover:shadow-gray-400 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-black '+" " +className}>{children}</button>
    </Link>
  )
}

export default CloseBtn