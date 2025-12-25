import React from 'react'
import DoctorSidebar from '../../components/sidebarDoctor/SideBarDoctor';
import DoctorNavbar from '../../components/doctorNavbar/DoctorNavbar';

function DoctorDashboard() {
    return (
        <div className="changePassword flex">
          <DoctorSidebar />
          <div className="changePasswordContainer flex-grow">
            <DoctorNavbar/>
            <div className="bg-yellow-100 min-h-screen md:py-10 md:px-40">
                 Section for alerts fetch alerts here
            </div>
            <div>
              
            </div>
          </div>
        </div>
      );
}

export default DoctorDashboard