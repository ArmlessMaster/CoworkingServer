import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG files are allowed'));
    }
};

const memoryStorage = multer.memoryStorage();
const upload = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
});

export default upload;