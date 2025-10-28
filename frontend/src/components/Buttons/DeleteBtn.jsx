
import React from 'react'

const DeleteBtn = ({className, children, type, onClick}) => {
  return (
    <div>
        <button onClick={onClick} type={type} className={'px-4 py-2 rounded-[5px] cursor-pointer transition-all hover:shadow-[2px_2px_5px] hover:shadow-gray-400 bg-[var(--error1)] hover:bg-[var(--error2)] text-white flex items-center gap-2 '+" " +className}>{children}</button>
    </div>
  )
}

export default DeleteBtn;