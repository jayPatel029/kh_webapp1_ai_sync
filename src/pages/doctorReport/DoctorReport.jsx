
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
      <div className="flex-1 block w-full">
          <div className="flex flex-col lg:flex-row flex-1">
                    <BarChart title="Patient by Age Group"/>
                    <PieChartComponent title="Patient by Gender"/>
                </div>
                <div className="flex flex-col lg:flex-row flex-1">
                    <SimpleLineChart title="Appointments"/>
                    <BarChartComponentPercentageReturn title="Percentage of Returning patients"/>
                </div>

                <div className="flex flex-col lg:flex-row flex-1">
                    <BarChartComponentAdh title="Adherence by Medicine"/>
                </div>


      </div>
  );
}


export default DoctorReport