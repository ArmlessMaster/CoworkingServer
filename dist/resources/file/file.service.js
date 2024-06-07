"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
class FileService {
    constructor() {
        this.uploadsDestination = `${process.env.UPLOADS_DESTINATION}`;
    }
    saveFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileExtension = this.getFileExtension(file.originalname);
                const fileUniqueSuffix = this.generateFileUniqueSuffix();
                const fileNewOriginalname = fileUniqueSuffix + fileExtension;
                yield fs_1.default.promises.writeFile(`${this.uploadsDestination}/${fileNewOriginalname}`, file.buffer, 'binary');
                return `${this.uploadsDestination}/${fileNewOriginalname}`;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    removeFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_1.default.promises.access(path, fs_1.default.constants.F_OK);
                yield fs_1.default.promises.unlink(path);
            }
            catch (error) { }
        });
    }
    generateFileUniqueSuffix() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    getFileExtension(originalName) {
        return (0, path_1.extname)(originalName);
    }
}
exports.default = FileService;
