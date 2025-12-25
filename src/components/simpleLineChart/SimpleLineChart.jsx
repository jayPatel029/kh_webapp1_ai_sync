import React, { PureComponent, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../helpers/axios/axiosInstance';
import { server_url } from '../../constants/constants';


const SimpleLineChart = ({ title }) => {

    const [data,setData]=React.useState([]);
    const [loading,setLoading] = React.useState(false);

    React.useEffect(()=>{
        setLoading(true);
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(`${server_url}/analytics/getPatientsByDoctorId`);
                console.log(response.data.data)
                setData(response.data.data);
                setLoading(false)
                
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    },[])

    if(loading) return <div>Loading....</div>



    return (
        <ResponsiveContainer width="100%" height="100%" aspect={2 / 1}>
            <div className='flex flex-row justify-between  p-5 pl-15 pr-15'>
            <span>
                {
                    title && (
                        <h3 style={{ textAlign: 'center' }}>
                            {title}
                        </h3>
                    )
                }
            </span>
            {/* <span>
                <select>
                    <option value="">By Week</option>
                    <option value="">By Month</option>
                    <option value="">By 6Month</option>
                </select>
            </span> */}

            </div>
           
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="online" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="inperson" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default SimpleLineChart;

