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
exports.verifyAccessToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createAccessToken = (accountId) => {
    return jsonwebtoken_1.default.sign({ id: accountId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_SECRET_LIFETIME,
    });
};
exports.createAccessToken = createAccessToken;
const verifyAccessToken = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, payload) => {
            if (err) {
                return reject(err);
            }
            resolve(payload);
        });
    });
});
exports.verifyAccessToken = verifyAccessToken;
exports.default = { createAccessToken: exports.createAccessToken, verifyAccessToken: exports.verifyAccessToken };
