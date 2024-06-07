import crypto from 'crypto';
import fs from 'fs';
import { extname } from 'path';

class FileService {
    private uploadsDestination = `${process.env.UPLOADS_DESTINATION}`;

    public async saveFile(file: Express.Multer.File): Promise<string | Error> {
        try {
            const fileExtension = this.getFileExtension(file.originalname);
            const fileUniqueSuffix = this.generateFileUniqueSuffix();
            const fileNewOriginalname = fileUniqueSuffix + fileExtension;
            await fs.promises.writeFile(
                `${this.uploadsDestination}/${fileNewOriginalname}`,
                file.buffer,
                'binary'
            );
            return `${this.uploadsDestination}/${fileNewOriginalname}`;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async removeFile(path: string): Promise<void | Error> {
        try {
            await fs.promises.access(path, fs.constants.F_OK);
            await fs.promises.unlink(path);
        } catch (error: any) {}
    }

    private generateFileUniqueSuffix(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    private getFileExtension(originalName: string): string {
        return extname(originalName);
    }
}

export default FileService;
