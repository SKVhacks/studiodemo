import React from 'react'

const Toast = ({msg , color}) => {
    return (
        <div role="alert" className={`alert text-black dark:text-white ${color}   toast toast-top toast-center fixed z-[9999]`}>
            <span className='text-base font-semibold capitalize'>{msg}</span>
        </div>
    )
}

export default Toast