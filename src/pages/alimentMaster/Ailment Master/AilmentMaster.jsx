import React, { useState, useEffect } from "react";
import AilmentList from "./AilmentList";
import { getLanguages } from "../../../ApiCalls/languageApis";
import {
  getAilments,
  addAilment,
  updateAilment,
} from "../../../ApiCalls/ailmentApis";
import { uploadFile } from "../../../ApiCalls/dataUpload";

export default function AilmentMasterComponent() {
  // State to hold the selected ailment data

  const [translations, setTranslations] = useState({});
  const [name, setName] = useState("");
  const [ailments, setAilments] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [Ailment_Img, setAilment_Img] = useState(null);
  const [errmsg, setErrmsg] = useState("");
  const [successmsg, setSuccessmsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getAilments().then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            console.log("Ailments:", resultAilment.data.listOfAilments);
            setAilments(resultAilment.data.listOfAilments);
            resultAilment.data.listOfAilments.forEach((element) => {
              if (element.ailmentTranslations) {
                let translationDict = {};
                element.ailmentTranslations.forEach((element) => {
                  translationDict[element.languageId] = element.name;
                }
                );
                setTranslations(translationDict); 
              }
            }
            );
                  

          } else {
            console.error("Failed to fetch Ailments:", resultAilment);
          }
        });
        
        getLanguages().then((resultLanguage) => {
          if (resultLanguage.success && resultLanguage.data) {
            setLanguages(resultLanguage.data);
            let transaltiondict = {};
            resultLanguage.data.forEach((lang) => {
              if (lang.id !== 1) {
                transaltiondict[lang.id] = "";
              }
            });
            setTranslations(transaltiondict);
          } else {
            console.error("Failed to fetch Languages:", resultLanguage);
          }
        });
      } catch (error) {
        console.error("Error fetching questions:", error.message);
      }
    };

    fetchData();
  }, [successmsg]);

  const getFileRes = async (file) => {
    try {
      if (file) {
        let formData = new FormData();
        formData.append("file", file, file?.name);
        const fileRes = await uploadFile(formData);
        return fileRes;
      } else {
        return { data: { objectUrl: "" } };
      }
    } catch (error) {
      setErrmsg("Error uploading file:", error);
    }
  };
  const clearFields = () => {
    setName("");
    let transaltiondict = {};
    languages.forEach((lang) => {
      if (lang.id !== 1) {
        transaltiondict[lang.id] = "";
      }
    });
    setEditMode(false);
    setTranslations(transaltiondict);
    setSuccessmsg("");
    setErrmsg("");
  };

  const submitAilment = async () => {
    const Ailment_Img_Url = await getFileRes(Ailment_Img);
    const ailmentData = {
      id: id,
      name: name,
      translations: translations,
      Ailment_Img: Ailment_Img_Url?.data?.objectUrl,
    };
    try {
      if (!editMode) {
        addAilment(ailmentData).then((result) => {
          if (result.success) {
            clearFields();
            setSuccessmsg("Ailment added successfully");
          } else {
            setErrmsg("Failed to add Ailment:", result);
          }
        });
      } else {
        updateAilment(id, ailmentData).then((result) => {
          if (result.success) {
            clearFields();
            setSuccessmsg("Ailment updated successfully");
          } else {
            setErrmsg("Failed to update Ailment:", result);
          }
        });
      }
    } catch (error) {
      console.error("Error adding Ailment:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
      <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
        <div className="border-b-2 border-gray-200 text-xl font-semibold p-4 text-primary">
          Ailment Master
        </div>

        <div>
          <div className="flex flex-col mt-4">
            <label className="block mb-2 text-sm font-medium text-gray-500">
              English Name
            </label>
            <input
              type="text"
              className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          {languages.map((language, index) => {
            if (language.id !== 1)
              return (
                <div key={index} className="flex flex-col mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-500">
                    {language.language_name}
                  </label>
                  <input
                    type="text"
                    className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                    value={translations[language.id]}
                    onChange={(e) => {
                      setTranslations({
                        ...translations,
                        [language.id]: e.target.value,
                      });
                    }}
                  />
                </div>
              );
          })}
          <div className="flex flex-col mt-4">
            <label className="block mb-2 text-sm font-medium text-gray-500">
              Icon
            </label>
            <input
              type="file"
              name="Resume"
              id="file-input"
              onChange={(event) => {
                setAilment_Img(event.target.files[0]);
              }}
              className="block w-full border border-gray-300 text-gray-500 shadow-sm rounded-lg text-sm focus:z-10 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none 
                        file:border-0
                      file:bg-gray-300 file:me-4
                      file:text-gray-600
                        file:py-2.5 file:px-4"
            />
          </div>
          <div className="mt-4">
            {!editMode ? (
              <button
                className="bg-primary text-white px-4 py-2 rounded-md w-1/3"
                onClick={submitAilment}>
                Submit
              </button>
            ) : (
              <>
                <button
                  onClick={submitAilment}
                  className=" flex-1 mr-2 mt-5 border md:inline-block text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-[12vw] rounded-lg p-1.5">
                  UPDATE
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    clearFields();
                  }}
                  className="flex-1 border text-[#ff0000] md:inline-block bg-white font-semibold tracking-wide text-lg border-[#ff0000] w-[12vw] rounded-lg  p-1.5">
                  CANCEL
                </button>
              </>
            )}
          </div>
          <div>
            {errmsg && (
              <div className="text-red-500 text-sm mt-2">{errmsg}</div>
            )}
            {successmsg && (
              <div className="text-primary text-sm mt-2">{successmsg}</div>
            )}
          </div>
        </div>
      </div>

      {/* AilmentList component */}
      <AilmentList
        setName={setName}
        setTranslations={setTranslations}
        ailments={ailments}
        setEditMode={setEditMode}
        setId={setId}
        setSuccessful={setSuccessmsg}
      />
    </div>
  );
}
