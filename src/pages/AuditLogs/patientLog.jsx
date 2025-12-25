import React, { useEffect, useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { Link } from "react-router-dom";
const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logs from the backend
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${server_url}/patient/patientLog`
      ); // Adjust the URL if your API endpoint differs
      if (!response) {
        throw new Error("Failed to fetch logs");
      }
      console.log("response", response);

      setLogs(response.data.logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Convert logs to CSV format
  const convertToCSV = (data) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]).join(","); // Extract headers
    const rows = data
      .map((log) =>
        Object.values(log)
          .map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      )
      .join("\n");

    return `${headers}\n${rows}`;
  };

  // Trigger CSV download
  const downloadCSV = () => {
    const csvData = convertToCSV(logs);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "logs.csv";
    link.click();
    URL.revokeObjectURL(url);
    
  };

  return (
    <div className="md:flex block">
    {/* Sidebar */}
    <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
      <Sidebar />
    </div>

    {/* Main Content */}
    <div className="md:flex-[5] block w-screen">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      
      <div className="max-w-5xl p-10">
      <Link to="/logs" className="text-blue-600 mb-4 inline-block">go back</Link>
      <h1 className="text-2xl font-bold mb-4">Patient Logs</h1>

      {loading && <p>Loading logs...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
          <>
          {/* Render Logs in a Table */}
          <table className="table-auto border-collapse border border-gray-300 w-full mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Patient ID</th>
                <th className="border border-gray-300 px-4 py-2">Field</th>
                <th className="border border-gray-300 px-4 py-2">Old Value</th>
                <th className="border border-gray-300 px-4 py-2">New Value</th>
                <th className="border border-gray-300 px-4 py-2">Changed At</th>
                <th className="border border-gray-300 px-4 py-2">Changed By</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 5).map((log, index) => ( // Display only the first 5 logs
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {log.patientId}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{log.field}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.oldValue}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.newValue}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(log.changedAt).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.changedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Download Button */}
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
            Download Logs as CSV
          </button>
        </>
      )}
    </div>
    </div>
  </div>
  );
};

export default LogsPage;
