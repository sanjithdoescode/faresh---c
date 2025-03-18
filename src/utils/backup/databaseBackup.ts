import { exec } from 'child_process';
import { uploadToS3 } from './s3Upload';
import { logEvent } from '../monitoring/logger';

export class DatabaseBackup {
  private readonly dbName: string;
  private readonly backupPath: string;

  constructor(dbName: string, backupPath: string) {
    this.dbName = dbName;
    this.backupPath = backupPath;
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString();
    const filename = `${this.dbName}-${timestamp}.dump`;
    const fullPath = `${this.backupPath}/${filename}`;

    try {
      await this.executePgDump(fullPath);
      await uploadToS3(fullPath, `backups/${filename}`);
      logEvent('info', 'Database backup completed', { filename });
      return filename;
    } catch (error) {
      logEvent('error', 'Database backup failed', { error });
      throw error;
    }
  }

  private executePgDump(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `pg_dump ${process.env.DATABASE_URL} -F c -b -v -f ${path}`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }
} 