import { database } from "@/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { FTPService } from "./FTPService";

let files = collection(database, "files");

export const addFiles = async (
  fileLink: string,
  fileName: string,
  folderId: string,
  userEmail: string,
) => {
  try {
    await addDoc(files, {
      fileLink: fileLink,
      fileName: fileName,
      isFolder: false,
      isStarred: false,
      isTrashed: false,
      folderId: folderId,
      userEmail: userEmail,
    });
  } catch (err) {
    console.error(err);
  }
};

export const addFolder = async (payload: payloadProps) => {
  try {
    await addDoc(files, {
      ...payload,
    });
  } catch (err) {
    console.error(err);
  }
};

export const renameFile = async (
  fileId: string,
  newName: string,
  isFolder: boolean,
) => {
  const fileRef = doc(files, fileId);
  try {
    await updateDoc(fileRef, {
      [isFolder ? "folderName" : "fileName"]: newName,
    });
  } catch (error) {
    console.error("Error updating file properties: ", error);
  }
};

export const starFile = async (fileId: string, isStarred: boolean) => {
  const fileRef = doc(files, fileId);
  try {
    await updateDoc(fileRef, {
      isStarred: isStarred,
    });
  } catch (error) {
    console.error("Error updating file properties: ", error);
  }
};

export const trashFile = async (fileId: string, isTrashed: boolean) => {
  const fileRef = doc(files, fileId);
  try {
    await updateDoc(fileRef, {
      isStarred: false,
      isTrashed: isTrashed,
    });
  } catch (error) {
    console.error("Error updating file properties: ", error);
  }
};

export const deleteFile = async (fileId: string, isFolder: boolean) => {
  const fileRef = doc(files, fileId);
  try {
    // Get the file data before deleting
    const fileSnapshot = await getDocs(query(files, where("id", "==", fileId)));
    const fileData = fileSnapshot.docs[0]?.data();

    // Delete from FTP if it's a file
    if (!isFolder && fileData) {
      const fileName = fileData.fileName;
      await FTPService.deleteFile(fileName);
    }

    // Delete from Firestore
    await deleteDoc(fileRef);

    // If it's a folder, also delete all files with the same folderId
    if (isFolder && fileId) {
      const filesQuery = query(files, where("folderId", "==", fileId));
      const querySnapshot = await getDocs(filesQuery);

      const deletePromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        if (!data.isFolder) {
          // Delete file from FTP
          await FTPService.deleteFile(data.fileName);
        }
        // Delete from Firestore
        return deleteDoc(doc.ref);
      });

      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.error("Error deleting file or folder: ", error);
  }
};