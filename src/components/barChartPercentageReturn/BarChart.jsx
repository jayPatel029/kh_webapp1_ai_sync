import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from "../../helpers/axios/axiosInstance"
import { server_url } from '../../constants/constants';

const BarChartComponentPercentageReturn = ({ title }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(server_url + '/analytics/getPercentageReturn');
                if (response.data.success) {
                    setChartData(response.data.data);
                } else {
                    console.error('Failed to fetch data:', response.data.error);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <ResponsiveContainer width="100%" height={300}>
            {title && <h3 style={{ textAlign: 'center' }}>{title}</h3>}
            <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#573837" activeBar={<Rectangle fill="yellow" stroke="blue" />} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default BarChartComponentPercentageReturn;
