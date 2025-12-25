import React from 'react'
import { BsPower } from "react-icons/bs";
function DoctorNavbar() {
  return (
    <div className="navbar items-center justify-end pr-10 bg-white">
      <span className="text-xl">Doctor</span>
      <BsPower
        className="text-red-900 ml-5 text-2xl font-extrabold cursor-pointer"
        // onClick={logout}
      />
    </div>
  )
}

export default DoctorNavbar