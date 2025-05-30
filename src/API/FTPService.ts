import { Client } from 'ftp-ts';

const ftpConfig = {
  host: process.env.NEXT_PUBLIC_FTP_HOST || '',
  port: parseInt(process.env.NEXT_PUBLIC_FTP_PORT || '21'),
  user: process.env.NEXT_PUBLIC_FTP_USER || '',
  password: process.env.NEXT_PUBLIC_FTP_PASSWORD || '',
};

export const ftpClient = new Client(ftpConfig);

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    await ftpClient.connect();
    const buffer = await file.arrayBuffer();
    await ftpClient.put(Buffer.from(buffer), `${path}/${file.name}`);
    await ftpClient.end();
    return `${process.env.NEXT_PUBLIC_FTP_BASE_URL}/${path}/${file.name}`;
  } catch (error) {
    console.error('FTP upload error:', error);
    throw error;
  }
};

export const deleteFile = async (path: string): Promise<void> => {
  try {
    await ftpClient.connect();
    await ftpClient.delete(path);
    await ftpClient.end();
  } catch (error) {
    console.error('FTP delete error:', error);
    throw error;
  }
};