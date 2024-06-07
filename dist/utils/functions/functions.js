"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAverageRating = exports.timeStringToMilliseconds = exports.fileUniqueSuffix = void 0;
const crypto_1 = __importDefault(require("crypto"));
function fileUniqueSuffix() {
    return crypto_1.default.randomBytes(16).toString('hex');
}
exports.fileUniqueSuffix = fileUniqueSuffix;
function timeStringToMilliseconds(time) {
    const parts = time.split(':');
    let hours = parseInt(parts[0]);
    let minutes = parts.length > 1 ? parseInt(parts[1]) : 0;
    return (hours * 3600 + minutes * 60) * 1000;
}
exports.timeStringToMilliseconds = timeStringToMilliseconds;
function calculateAverageRating(estimate) {
    if (estimate.length === 0)
        return 0;
    const totalRating = estimate.reduce((sum, current) => sum + current.rating, 0);
    return Math.round(totalRating / estimate.length);
}
exports.calculateAverageRating = calculateAverageRating;
