import { Client } from "basic-ftp";
import { addFiles } from "@/API/Firestore";

const ftpConfig = {
  host: "your-ftp-host",
  user: "your-ftp-username",
  password: "your-ftp-password",
  secure: true
};

const fileUpload = async (
  file: File,
  setProgress: Function,
  parentId: string,
  userEmail: string,
) => {
  const client = new Client();
  
  try {
    await client.access(ftpConfig);
    
    // Create a buffer from the file
    const buffer = await file.arrayBuffer();
    
    // Upload the file with progress tracking
    await client.uploadFrom(Buffer.from(buffer), file.name);
    
    // Construct the file URL based on your FTP server's public URL
    const fileUrl = `https://your-ftp-public-url/${file.name}`;
    
    // Add file metadata to Firestore
    await addFiles(fileUrl, file.name, parentId, userEmail);
    
    setProgress((prev: number[]) => [...prev, { [file.name]: 100 }]);
  } catch (error) {
    console.error("FTP upload error:", error);
    alert("Failed to upload file");
  } finally {
    client.close();
  }
};

export default fileUpload;