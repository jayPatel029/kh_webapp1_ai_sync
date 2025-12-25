import { dummyadmin } from "../assets";

export default function getValidImageUrl(url) {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  const isValidUrl = urlRegex.test(url);
  const profilePhotoUrl = isValidUrl ? url : dummyadmin;
  return profilePhotoUrl;
}

export const formatDate = (dateString) => {
  // if (!dateString) return "";
  // const dateObject = new Date(dateString);
  // const day = String(dateObject.getDate()).padStart(2, "0");
  // const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  // const year = dateObject.getFullYear();
  // return `${day}-${month}-${year}`;
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

// export function checkURl(url) {
//     const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
//     url = encodeURIComponent(url);
//     console.log(url);
//     const isValidUrl = urlRegex.test(url);
//     const res = isValidUrl ? true : false;
//     return res;
// }

export function checkURl(url) {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  // Decode the URL
  const decodedUrl = decodeURIComponent(url);
  // Check if the URL is valid and ends with an image extension
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  const isValidUrl = urlRegex.test(decodedUrl);
  const extension = decodedUrl.split(".").pop().toLowerCase();
  const isImage = imageExtensions.includes(extension);
  return isValidUrl && isImage;
}

export function isValidHttpUrl(url) {
  return /^http/i.test(url);
}

export const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};
