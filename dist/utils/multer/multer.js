"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPEG and PNG files are allowed'));
    }
};
const memoryStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: fileFilter,
});
exports.default = upload;
