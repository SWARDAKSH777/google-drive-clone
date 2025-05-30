import { FTPService } from "./FTPService";
import { addFiles } from "@/API/Firestore";

const fileUpload = async (
  file: File,
  setProgress: Function,
  parentId: string,
  userEmail: string,
) => {
  try {
    // Start progress indication
    setProgress((prev: number[]) => [...prev, { [file.name]: 0 }]);
    
    // Upload to FTP
    const fileUrl = await FTPService.uploadFile(file);
    
    // Add file metadata to Firestore
    await addFiles(fileUrl, file.name, parentId, userEmail);
    
    // Complete progress
    setProgress((prev: number[]) => [...prev, { [file.name]: 100 }]);
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Failed to upload file");
    setProgress((prev: number[]) => [...prev, { [file.name]: -1 }]);
  }
};

export default fileUpload;