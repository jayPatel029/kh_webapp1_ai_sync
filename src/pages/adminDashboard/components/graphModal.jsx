import React, { useEffect, useState } from 'react'
import LineChartComponent from "../../../components/Linechart/LineChartComponent"
import LineChartComponentSys from "../../../components/linecomponent-sys-dys/LineChartComponentSys"
import Table from "../../../components/table/table"
import LineChartDialysis from "../../../components/Linechart/Linechart_Dialysis/LineChartDialysis"
import LineChartDialyisisSys from "../../../components/Linechart/Linechart_Dialysis/LineChartDialyisisSys"
import { getSystolicIdByTitle, getDialysisSystolicIdByTitle } from "../../../ApiCalls/readingsApis";
import ThemedModalShell from "../../../components/modals/ThemedModalShell";
import AlertViewerToolbar from "../../../components/dashboard/AlertViewerToolbar";

const GraphModal = ({ closeModal, patientId, questionId, dailyordia, isGraph, questionTitle, questionUnit }) => {
    // console.log(patientId, questionId, dailyordia, isGraph)
    const [systolicId, setSystolicId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modifiedTitle,setModifiedTitle]=useState(questionTitle)


    const componentToRenderFunc = () => {
        if (dailyordia == "daily") {
            if (questionTitle.toLowerCase().includes("systolic")) {
                
                // const systolicIndex = questionTitle.toLowerCase().indexOf("systolic");
                // const systolicEndIndex = systolicIndex + "systolic".length;
                // // Insert "+ and Diastolic" after "systolic"
                // const modifiedTitle = questionTitle.slice(0, systolicEndIndex) + " and Diastolic" + questionTitle.slice(systolicEndIndex);
                // console.log("systolic modified..",modifiedTitle)
                return (
                    <LineChartComponentSys
                        aspect={2 / 1}
                        questionId={questionId}
                        user_id={patientId}
                        title={(() => {
                            const systolicIndex = questionTitle.toLowerCase().indexOf("systolic");
                            const systolicEndIndex = systolicIndex + "systolic".length;
                            // Insert " and Diastolic" after "systolic"
                            const modifiedTitle = questionTitle.slice(0, systolicEndIndex) + " and Diastolic" + questionTitle.slice(systolicEndIndex);
                            return modifiedTitle;
                        })()}
                        unit={questionUnit}
                        isPatientProfile={null}
                    />
                );
            } 
            else if (questionTitle.toLowerCase().includes("diastolic")) {
                var correspondingSysId = 0;
                try {
                    const fetchSystolicId = async () => {
                        try {
                            // Make a GET request to your backend API endpoint
                            const response = await getSystolicIdByTitle(questionTitle);

                            // Extract the systolic ID from the response
                            const fetchedSystolicId = response.data;
                            // console.log("fetchedSystolicId",fetchedSystolicId)

                            // Update the state with the fetched systolic ID
                            setSystolicId(fetchedSystolicId);
                            correspondingSysId=fetchedSystolicId;
                        } catch (error) {
                            console.error('Error fetching systolic ID:', error);
                            // Handle any errors here
                        }finally {
                            setLoading(false); // Set loading state to false after fetching
                        }
                    };
                    const fetchData = async () => {
                        await fetchSystolicId()
                    }
                    // console.log(questionTitle)
                    fetchData()

                } catch (error) {
                    console.log(error)
                }

                const systolicIndex = questionTitle.toLowerCase().indexOf("diastolic");
                const systolicEndIndex = systolicIndex + "diastolic".length;
                // Insert "and Diastolic" after "systolic"
                const modifiedTitle = questionTitle.slice(0, systolicEndIndex) + " and Systolic" + questionTitle.slice(systolicEndIndex);

                if (loading) {
                    return <div>Loading...</div>; // Placeholder for loading state
                }

                if (!systolicId) {
                    return <div>No systolic ID found.</div>; // Placeholder for no systolic ID
                }

                return (
                    <LineChartComponentSys
                        aspect={2 / 1}
                        questionId={systolicId}
                        user_id={patientId}
                        title={modifiedTitle}
                        unit={questionUnit}
                        isPatientProfile={null}
                    />
                );

            }
            else {
                return (<LineChartComponent
                    aspect={2 / 1}
                    questionId={questionId}
                    user_id={patientId}
                    title={questionTitle}
                    unit={questionUnit}
                    isPatientProfile={null}
                />)
            }

        } else {
            if (questionTitle.toLowerCase().includes("systolic")) {
                const systolicIndex = questionTitle.toLowerCase().indexOf("systolic");
                const systolicEndIndex = systolicIndex + "systolic".length;
                // Insert "+ and Diastolic" after "systolic"
                const modifiedTitle = questionTitle.slice(0, systolicEndIndex) + " and Diastolic" + questionTitle.slice(systolicEndIndex);
                return (
                    <LineChartDialyisisSys
                        aspect={2 / 1}
                        questionId={questionId}
                        user_id={patientId}
                        title={modifiedTitle}
                        unit={questionUnit}
                        isPatientProfile={null}
                    />
                );
            }else if (questionTitle.toLowerCase().includes("diastolic")) {
                var correspondingSysId = 0;
                try {
                    const fetchSystolicId = async () => {
                        try {
                            
                            const response = await getDialysisSystolicIdByTitle(questionTitle);
                            console.log("res",response)
                            // Extract the systolic ID from the response
                            const fetchedSystolicId = response.data;
                            // console.log("fetchedSystolicId",fetchedSystolicId)

                            // Update the state with the fetched systolic ID
                            setSystolicId(fetchedSystolicId);
                            correspondingSysId=fetchedSystolicId;
                        } catch (error) {
                            console.error('Error fetching systolic ID:', error);
                            // Handle any errors here
                        }finally {
                            setLoading(false); // Set loading state to false after fetching
                        }
                    };
                    const fetchData = async () => {
                        await fetchSystolicId()
                    }
                    // console.log(questionTitle)
                    fetchData()

                } catch (error) {
                    console.log(error)
                }

                const systolicIndex = questionTitle.toLowerCase().indexOf("diastolic");
                const systolicEndIndex = systolicIndex + "diastolic".length;
                // Insert "and Diastolic" after "systolic"
                const modifiedTitle = questionTitle.slice(0, systolicEndIndex) + " and Systolic" + questionTitle.slice(systolicEndIndex);

                if (loading) {
                    return <div>Loading...</div>; // Placeholder for loading state
                }

                if (!systolicId) {
                    return <div>No systolic ID found.</div>; // Placeholder for no systolic ID
                }

                return (
                    <LineChartDialyisisSys
                        aspect={2 / 1}
                        questionId={systolicId}
                        user_id={patientId}
                        title={modifiedTitle}
                        unit={questionUnit}
                        isPatientProfile={null}
                    />
                );

            } 
            else {
                return (<LineChartDialysis
                    aspect={2 / 1}
                    questionId={questionId}
                    user_id={patientId}
                    title={questionTitle}
                    unit={questionUnit}
                    isPatientProfile={null}
                />)
            }
        }
    }


    return (
        <ThemedModalShell
            title={questionTitle || "Graph"}
            onClose={closeModal}
            width="min(1100px, 96vw)"
            maxHeight="90vh"
            zIndex={70}
            bodyClassName="px-4 sm:px-5 py-4"
            toolbar={patientId ? <AlertViewerToolbar patientId={patientId} /> : null}
        >
            <div className="w-full min-h-[320px]">
                {componentToRenderFunc()}
            </div>
        </ThemedModalShell>
    )
    
}

export default GraphModal
