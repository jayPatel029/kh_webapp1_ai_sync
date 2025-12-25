import React from "react";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import { deleteAilment } from "../../../ApiCalls/ailmentApis";

const AilmentList = ({
  setName,
  setTranslations,
  ailments,
  setEditMode,
  setId,
  setSuccessful,
}) => {
  return (
    <div className=" p-7 mt-5 bg-white shadow-md border-t-4 border-primary">
      <div className="text-left">
        <h1 className="text-xl mb-2 text-left inline-block">Ailment List </h1>
        <p className="text-xs mb-4 text-left inline-block ml-1">
          ({ailments.length} records found)
        </p>
      </div>

      {/* Table with alternating background colors */}
      <table className="w-full border-collapse">
        <thead className="border-b border-gray-500 mt-1">
          <tr>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Icons</th>
            <th className="py-2 px-4 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {ailments.map((item, index) => (
            <tr
              key={index}
              className={
                index % 2 === 0
                  ? "bg-gray-100 cursor-pointer hover:bg-slate-300"
                  : "bg-white cursor-pointer hover:bg-slate-300"
              }>
              <td className="py-2 px-4" style={{ width: "50%" }}>
                {/* Text input for Name column with cursor-pointer class */}
                {item.name}
              </td>
              <td className="py-2 px-4" style={{ width: "25%" }}>
                {/* Image for Icons column */}
                <img
                  src={item.Ailment_Img}
                  alt="Icon"
                  className="w-8 h-8 object-contain"
                />
              </td>
              <td className="py-2 px-4" style={{ width: "25%" }}>
                {/* Action buttons for Actions column */}
                <div className="flex">
                  <button
                    className="text-primary inline-block mx-2 text-2xl"
                    onClick={() => {
                      setSuccessful("");
                      setName(item.name);
                      setId(item.id);
                      if (item.ailmentTranslations) {
                        let translationDict = {};

                        item.ailmentTranslations.forEach((element) => {
                          translationDict[element.languageId] = element.name;
                        });
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
                  <button
                    className="text-[#ff0000] inline-block mx-2 text-2xl"
                    onClick={async () => {
                      try {
                        setSuccessful("");
                        await deleteAilment(item.id);
                      } catch (error) {
                        console.error("Error deleting Ailment:", error);
                      }
                      setSuccessful("Reading Deleted Successful!");
                    }}>
                    <BsTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AilmentList;
