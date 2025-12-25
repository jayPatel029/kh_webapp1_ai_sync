import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import BarChart from '../../components/barChart/BarChart';
import PieChartComponent from '../../components/pieChart/PieChart';
import MixedBarChart from '../../components/mixedBarChart/MixedBarChart';
import SimpleLineChart from '../../components/simpleLineChart/SimpleLineChart';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../helpers/axios/axiosInstance';
import BarChartComponentPercentageReturn from '../../components/barChartPercentageReturn/BarChart';
import BarChartComponentAdh from '../../components/horizontalBarChartAdherance/BarChart';
function DoctorReport() {
    return (
        <div className="md:flex block">
            {/* Sidebar */}
            <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="md:flex-[5] block w-screen">
                <div className="sticky top-0 z-10">
                    <Navbar />
                </div>
                <div className="flex flex-row flex-1">
                    <BarChart title="Patient by Age Group"/>
                    <PieChartComponent title="Patient by Gender"/>
                </div>
                <div className="flex flex-row flex-1">
                    <SimpleLineChart title="Appointments"/>
                    <BarChartComponentPercentageReturn title="Percentage of Returning patients"/>
                </div>

                <div className="flex flex-row flex-1">
                    <BarChartComponentAdh title="Adherence by Medicine"/>
                </div>


              
            </div>
        </div>
    );
}


export default DoctorReport