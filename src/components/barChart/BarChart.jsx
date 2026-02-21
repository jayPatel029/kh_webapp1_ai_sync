import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPatientsByAge } from '../../ApiCalls/analyticsApis';

const BarChartComponent = ({ title }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPatientsByAge();
                if (response.success && response.data.success) {
                    const data = [];
                    const object = response.data.data;
                    for (const property in object) {
                        data.push({
                            name: property,
                            count: object[property].length,
                        });
                    }
                    setChartData(data);
                } else {
                    console.error('Failed to fetch data:', response.data?.error);
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
                <Bar dataKey="count" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default BarChartComponent;
