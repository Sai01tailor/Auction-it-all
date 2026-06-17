import React from 'react'
import { ToastContainer, toast } from 'react-toastify';
const toastIT = (message) => {
    const notify = (message) => toast(message);
  return (
    <div>
      <ToastContainer />
    </div>
  )
}

export default toast