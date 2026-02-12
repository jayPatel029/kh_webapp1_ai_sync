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
}) => {
  return (
    <div>
      <div className="w-full overflow-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Icon</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {ailments.map((item, index) => (
              <tr
                key={item.id || index}
                className={index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
              >
                <td className="py-3 px-4 align-middle">{item.name}</td>
                <td className="py-3 px-4 align-middle w-24">
                  {item.Ailment_Img ? (
                    <img src={item.Ailment_Img} alt={`${item.name} icon`} className="w-8 h-8 object-contain" />
                  ) : (
                    <Text className="text-sm text-muted">—</Text>
                  )}
                </td>
                <td className="py-3 px-4 align-middle">
                  <div className="flex items-center gap-2">
                    <IconButton
                      aria-label={`Edit ${item.name}`}
                      title={`Edit ${item.name}`}
                      icon={<BsPencilSquare />}
                      variant="ghost"
                      size="lg"
                      className="text-primary text-2xl font-bold hover:bg-primary/10 rounded-md"
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
                        // Scroll to the form
                        const el = document.getElementById("ailment-form");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                    />

                    <IconButton
                      aria-label={`Delete ${item.name}`}
                      title={`Delete ${item.name}`}
                      icon={<BsTrash />}
                      variant="ghost"
                      size="lg"
                      className="text-danger text-2xl font-bold hover:bg-red-50 rounded-md"
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
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ailments.length === 0 && (
        <div className="mt-4 text-center text-sm text-muted">No records found</div>
      )}
    </div>
  );
};

export default AilmentList;
