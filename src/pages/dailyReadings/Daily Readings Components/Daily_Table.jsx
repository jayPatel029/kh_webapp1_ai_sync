import React, { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "../../../assets/search_icon.svg";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import {
  deleteDailyReading,
  getDailyReadings,
} from "../../../ApiCalls/readingsApis";
import { useSelector } from "react-redux";

export default function DailyTable({
  setEditMode,
  newReadingDsipatch,
  successful,
  setSuccessful,
  setTranslations,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [resetter, setResetter] = useState(false);
  const role = useSelector((state) => state.permission);
  useEffect(() => {
    console.log("role here", role);
    getDailyReadings()
      .then((data) => setTableData(data.data))
      .catch((error) => console.error("Error fetching data:", error));
      console.log('data', tableData);
  }, [successful, resetter]);

  const filteredData = tableData.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // console.log('data',filteredData);

  return (
    <>
      <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md mt-10">
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Search Term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 w-56 h-8"
          />
          <SearchIcon className="ml-2 w-8 h-8 text-gray-400 border border-gray-300 p-1 rounded" />
        </div>
        <div>
          <div className="text-left">
            <h1 className="text-xl mb-2 text-left inline-block">
              Daily Readings List
            </h1>
            <p className="text-xs mb-4 text-left inline-block ml-1">
              ({tableData.length} records found)
            </p>
          </div>
        </div>
        <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
          <thead className="text-base text-gray-700 border-b-2 border-gray-800 ">
            <tr>
              <th scope="col" className="px-6 py-3 w-1/3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Alert Text
              </th>
              <th scope="col" className="px-6 py-3">
                Ailment
              </th>
              <th scope="col" className="px-6 py-3">
                Condition
              </th>
              <th scope="col" className="px-6 py-3">
                Acion
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              const displayAilment = item.ailments
                .map((x) => x.name)
                .join(", ");
              if (item.showUser === 0) {
                return (
                  <tr key={index} className="bg-white border-b ">
                    <td className="px-6 py-4">{item.title}</td>
                    <td className="px-6 py-4">{item.alertTextDoc}</td>
                    <td className="px-6 py-4">{displayAilment}</td>
                   <td className="px-6 py-4">{item.condition}</td>
                    <td className="px-6 py-4 text-2xl">
                  
                      {role.canEditDailyReadings ? (
                        <button
                        className="text-primary inline-block mx-2"
                        onClick={() => {
                          setSuccessful("");
                          newReadingDsipatch({
                            type: "all",
                            payload: {
                              id: item.id,
                              ailment: item.ailments.map((x) => {
                                return { value: x.id, label: x.name };
                              }),
                              type: item.type,
                              title: item.title,
                              assign_range: item.assign_range,
                              lower_assign_range: item.low_range,
                              upper_assign_range: item.high_range,
                              sendAlert : item.sendAlert ? 1 : 0,
                              unit: item.unit,
                              isGraph: item.is_graph ? 1 : 0,
                              alertTextDoc: item.alertTextDoc,
                              condition: item.condition,
                            },
                          });
                          if (item.daily_readings_translations) {
                            let translationDict = {};

                            item.daily_readings_translations.forEach(
                              (element) => {
                                translationDict[element.language_id] =
                                  element.title;
                              }
                            );
                            setTranslations(translationDict);
                          }
                          setEditMode(true);
                          window.scrollTo({
                            top: 0,
                            left: 0,
                            behavior: "smooth",
                          });
                        }}>
                        <BsPencilSquare />
                      </button>
                  
                      ) : null} 
                      
                      {role.canDeleteDailyReadings ?(
                           <button
                           className="text-[#ff0000] inline-block mx-2 "
                           onClick={() => {
                             setSuccessful("");
                             deleteDailyReading(item.id).then(() => {
                               setSuccessful("Reading Deleted Successful!");
                               setResetter(!resetter);
                             });
                           }}>
                           <BsTrash />
                         </button>
                      
                      ):null} 
                   
                   
                    </td>


                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
