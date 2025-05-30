import { Client } from "basic-ftp";
import { env } from "@/env.mjs";

export const ftpConfig = {
  host: env.FTP_HOST,
  user: env.FTP_USER,
  password: env.FTP_PASSWORD,
  secure: true,
  baseUrl: env.FTP_BASE_URL
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