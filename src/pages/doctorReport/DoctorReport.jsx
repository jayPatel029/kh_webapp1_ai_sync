import BarChart from '../../components/barChart/BarChart';
import PieChartComponent from '../../components/pieChart/PieChart';
import MixedBarChart from '../../components/mixedBarChart/MixedBarChart';
import SimpleLineChart from '../../components/simpleLineChart/SimpleLineChart';
import React, { useEffect, useState } from 'react';
import BarChartComponentPercentageReturn from '../../components/barChartPercentageReturn/BarChart';
import BarChartComponentAdh from '../../components/horizontalBarChartAdherance/BarChart';
import { getDoctorReportLogs } from '../../ApiCalls/doctorApis';

function DoctorReport() {
    const [reportLogs, setReportLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoadingLogs(true);
                const res = await getDoctorReportLogs();
                if (res.success) {
                    setReportLogs(res.data?.data || []);
                }
            } catch (e) {
                console.error('Error fetching report logs:', e);
            } finally {
                setLoadingLogs(false);
            }
        };
        fetchLogs();
    }, []);

    return (
      <div className="flex-1 block w-full overflow-y-auto p-4">
          <h1 className="text-2xl font-bold text-[#32617d] mb-4">Doctor Reports</h1>

          {/* Charts Section */}
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

          {/* Report Logs */}
          <div className="mt-8">
              <h2 className="text-xl font-bold text-[#32617d] mb-4">Report Activity Logs</h2>
              {loadingLogs ? (
                  <p className="text-gray-500">Loading logs...</p>
              ) : reportLogs.length === 0 ? (
                  <p className="text-gray-400">No report logs available.</p>
              ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                              <tr>
                                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                                  <th className="px-4 py-2 text-left text-gray-600">Action</th>
                                  <th className="px-4 py-2 text-left text-gray-600">Details</th>
                              </tr>
                          </thead>
                          <tbody>
                              {reportLogs.slice(0, 20).map((log, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="px-4 py-2 text-gray-700">
                                          {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '-'}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">{log.action || log.type || '-'}</td>
                                      <td className="px-4 py-2 text-gray-500">{log.message || log.details || '-'}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      </div>
  );
}


export default DoctorReport