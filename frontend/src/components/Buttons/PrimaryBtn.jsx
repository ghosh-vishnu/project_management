import React from 'react'
import { Link } from 'react-router'

const PrimaryBtn = ({to, className, children, type, onClick, disabled}) => {
  return (
    <div>
        <button onClick={onClick} type={type} disabled = { disabled ? disabled: false} className={'px-4 py-2 rounded-[5px] cursor-pointer transition-all hover:shadow-[2px_2px_5px] hover:shadow-gray-400 bg-[var(--primary1)] hover:bg-[var(--primary2)] text-white flex items-center gap-2 '+" " +className}>{children}</button>
    </div>
  )
}

export default PrimaryBtn