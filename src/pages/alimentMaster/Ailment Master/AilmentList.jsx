import React from "react";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import { deleteAilment } from "../../../ApiCalls/ailmentApis";
import { IconButton, Text } from "../../../component-library";

const AilmentList = ({
  setName,
  setTranslations,
  ailments,
  setEditMode,
  setId,
  setSuccessful,
  onOpenEditModal,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Icon</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {ailments.map((item, index) => (
            <tr key={item.id || index}>
              <td>{item.name}</td>
              <td>
                {item.Ailment_Img ? (
                  <img src={item.Ailment_Img} alt={`${item.name} icon`} className="w-8 h-8 object-contain" />
                ) : (
                  <Text className="text-sm text-gray-400">—</Text>
                )}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <button
                    className="admin-action-btn admin-action-btn--edit"
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
                      onOpenEditModal?.();
                    }}
                    title={`Edit ${item.name}`}
                  >
                    <BsPencilSquare size={18} />
                  </button>

                  <button
                    className="admin-action-btn admin-action-btn--delete"
                    onClick={async () => {
                      try {
                        setSuccessful("");
                        await deleteAilment(item.id);
                        setSuccessful("Ailment deleted successfully!");
                      } catch (error) {
                        console.error("Error deleting Ailment:", error);
                        setSuccessful("Error deleting ailment");
                      }
                    }}
                    title={`Delete ${item.name}`}
                  >
                    <BsTrash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {ailments.length === 0 && (
        <div className="p-4 text-center text-gray-500">No records found</div>
      )}
      </div>
    </div>
  );
};

export default AilmentList;
