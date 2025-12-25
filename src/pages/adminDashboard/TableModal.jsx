import React, { useEffect } from 'react'
import LineChartComponent from '../../components/Linechart/LineChartComponent'
import LineChartComponentSys from '../../components/linecomponent-sys-dys/LineChartComponentSys'
import Table from '../../components/table/table'
import DialysisTable from '../../components/table/DialysisTable'

const TableModal = ({ closeModal, patientId, questionId, dailyordia, isGraph, questionTitle, questionUnit }) => {
    // console.log(patientId, questionId, dailyordia, isGraph)


    const componentToRenderFunc = () => {

        if (dailyordia === "daily") {
            return (
                <Table
                    questionId={questionId}
                    user_id={patientId}
                    title={questionTitle}
                    isPatientProfile={null}
                />
            )

        } else {
            return (
                <DialysisTable
                    questionId={questionId}
                    user_id={patientId}
                    title={questionTitle}
                    isPatientProfile={null}
                />
            )

        }

    }


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black w-full">
            <div className="p-7 ml-4 mr-4 mt-4 bg-white w-full md:w-3/5 h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-y-auto">
                <div className="header flex justify-between items-center border-b pb-2 mb-4">
                    <h1 className="text-2xl font-bold">{questionTitle}</h1>
                    <button
                        onClick={closeModal}
                        className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                    >
                        Close
                    </button>
    
                </div>
    
                <div className="w-full">
                    {componentToRenderFunc()}
                </div>
            </div>
        </div>
    )
    
}

export default TableModal