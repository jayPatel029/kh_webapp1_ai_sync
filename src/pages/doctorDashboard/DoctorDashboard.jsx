import React from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';

function DoctorDashboard() {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-grow flex flex-col h-screen overflow-hidden">
          <Navbar />
          <div className="flex-grow p-10 px-40 overflow-y-auto bg-yellow-100">
            Section for alerts fetch alerts here
            </div>
          </div>
        </div>
      );
}

export default DoctorDashboard;