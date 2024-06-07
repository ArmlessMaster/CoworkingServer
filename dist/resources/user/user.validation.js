"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const create = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(1).required(),
    password_confirmation: joi_1.default.any().equal(joi_1.default.ref('password')).required(),
});
const login = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(3).required(),
});
exports.default = { create, login };
