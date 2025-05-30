import { Client } from "basic-ftp";

export const ftpConfig = {
  host: "your-ftp-host",
  user: "your-ftp-username",
  password: "your-ftp-password",
  secure: true,
  baseUrl: "https://your-ftp-public-url" // Public URL where files are accessible
};

export class FTPService {
  private static client: Client;

  private static async getClient() {
    if (!this.client) {
      this.client = new Client();
      await this.client.access(ftpConfig);
    }
    return this.client;
  }

  static async uploadFile(file: File): Promise<string> {
    const client = await this.getClient();
    const buffer = await file.arrayBuffer();
    
    try {
      await client.uploadFrom(Buffer.from(buffer), file.name);
      return `${ftpConfig.baseUrl}/${file.name}`;
    } catch (error) {
      console.error("FTP upload error:", error);
      throw error;
    }
  }

  static async deleteFile(fileName: string): Promise<void> {
    const client = await this.getClient();
    try {
      await client.remove(fileName);
    } catch (error) {
      console.error("FTP delete error:", error);
      throw error;
    }
  }

  static async listFiles(): Promise<string[]> {
    const client = await this.getClient();
    try {
      const list = await client.list();
      return list.map(item => item.name);
    } catch (error) {
      console.error("FTP list error:", error);
      throw error;
    }
  }
}