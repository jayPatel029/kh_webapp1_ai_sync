import { uploadFile } from "../ApiCalls/dataUpload";

export const getFileRes = async (file, fileName = "") => {
  try {
    if (file) {
      let formData = new FormData();
      formData.append("file", file, fileName || file.name);
      const fileRes = await uploadFile(formData);
      console.log("fileRes",fileRes)
      return fileRes;
    } else {
      console.log("here");
      return { data: { objectUrl: "" } };
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return { data: { objectUrl: "" } };
  }
};
