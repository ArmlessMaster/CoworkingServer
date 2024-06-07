"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const days_enum_1 = require("@/utils/enums/days.enum");
const joi_1 = __importDefault(require("joi"));
const libphonenumber_js_1 = __importDefault(require("libphonenumber-js"));
const getAvailableAppointmentTimes = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
    date: joi_1.default.date().required(),
    seatsNumber: joi_1.default.number().min(1).required(),
});
const create = joi_1.default.object({
    name: joi_1.default.string().min(1).max(150).required(),
    region: joi_1.default.string().min(1).max(150).required(),
    city: joi_1.default.string().min(1).max(150).required(),
    address: joi_1.default.string().min(1).max(255).required(),
    phoneNumber: joi_1.default.custom((value, helpers) => {
        var _a;
        if (!((_a = (0, libphonenumber_js_1.default)(value)) === null || _a === void 0 ? void 0 : _a.isValid())) {
            return helpers.error('Invalid phone number format');
        }
        return value;
    }).required(),
    email: joi_1.default.string().email().min(1).max(255),
    description: joi_1.default.string().min(1).required(),
    price: joi_1.default.number().min(0).required(),
    maxSeats: joi_1.default.number().min(1).required(),
    service: joi_1.default.array().min(3).items(joi_1.default.string()),
    workSchedule: joi_1.default.array().items(joi_1.default.object({
        day: joi_1.default.string()
            .valid(days_enum_1.DaysEnum.MONDAY, days_enum_1.DaysEnum.TUESDAY, days_enum_1.DaysEnum.WEDNESDAY, days_enum_1.DaysEnum.THURSDAY, days_enum_1.DaysEnum.FRIDAY, days_enum_1.DaysEnum.SATURDAY, days_enum_1.DaysEnum.SUNDAY)
            .required(),
        startWorkTime: joi_1.default.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
        endWorkTime: joi_1.default.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
        isWorkingDay: joi_1.default.bool().default(true),
    })),
});
const update = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
    name: joi_1.default.string().min(1).max(150),
    region: joi_1.default.string().min(1).max(150),
    city: joi_1.default.string().min(1).max(150),
    address: joi_1.default.string().min(1).max(255),
    phoneNumber: joi_1.default.custom((value, helpers) => {
        var _a;
        if (!((_a = (0, libphonenumber_js_1.default)(value)) === null || _a === void 0 ? void 0 : _a.isValid())) {
            return helpers.error('Invalid phone number format');
        }
        return value;
    }).allow(null),
    email: joi_1.default.string().email().min(1).max(255).allow(null),
    description: joi_1.default.string().min(1),
    price: joi_1.default.number().min(0),
    maxSeats: joi_1.default.number().min(1),
    service: joi_1.default.array().min(3).items(joi_1.default.string()),
    workSchedule: joi_1.default.array().items(joi_1.default.object({
        day: joi_1.default.string()
            .valid(days_enum_1.DaysEnum.MONDAY, days_enum_1.DaysEnum.TUESDAY, days_enum_1.DaysEnum.WEDNESDAY, days_enum_1.DaysEnum.THURSDAY, days_enum_1.DaysEnum.FRIDAY, days_enum_1.DaysEnum.SATURDAY, days_enum_1.DaysEnum.SUNDAY)
            .required(),
        startWorkTime: joi_1.default.string()
            .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
            .allow('', null),
        endWorkTime: joi_1.default.string()
            .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
            .allow('', null),
        isWorkingDay: joi_1.default.bool().default(true),
    })),
});
const search = joi_1.default.object({
    filterOptionRating: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.number().min(0).max(5)), joi_1.default.number()),
    filterOptionMinPrice: joi_1.default.number().min(0),
    filterOptionMaxPrice: joi_1.default.number().min(0),
    searchParameter: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.number()),
    page: joi_1.default.number().min(1),
    perPage: joi_1.default.number().min(1),
}).custom((value, helpers) => {
    const minPrice = value.filterOptionMinPrice;
    const maxPrice = value.filterOptionMaxPrice;
    if (minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice >= maxPrice) {
        return helpers.error('Min price must be greater than max price');
    }
    return value;
}, 'Min price must be greater than max price');
const remove = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
});
const uploadImage = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
    file: joi_1.default.object(),
});
const deleteImage = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
    path: joi_1.default.string().required(),
});
const createEstimate = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
    userId: joi_1.default.string().length(36).required(),
    rating: joi_1.default.number().min(1).max(5).required(),
    review: joi_1.default.string().default(''),
});
const deleteEstimate = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
    estimateId: joi_1.default.string().hex().length(24).required(),
    userId: joi_1.default.string().length(36).required(),
});
const createSurvey = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
    userId: joi_1.default.string().length(36).required(),
    name: joi_1.default.alternatives()
        .try(joi_1.default.number(), joi_1.default.string().min(1).max(150))
        .required(),
    email: joi_1.default.string().email().min(1).max(255).required(),
    phoneNumber: joi_1.default.custom((value, helpers) => {
        var _a;
        if (!((_a = (0, libphonenumber_js_1.default)(value)) === null || _a === void 0 ? void 0 : _a.isValid())) {
            return helpers.error('Invalid phone number format');
        }
        return value;
    }).required(),
    date: joi_1.default.date().required(),
    startTime: joi_1.default.string()
        .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
        .required(),
    endTime: joi_1.default.string()
        .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
        .required(),
    numberSeats: joi_1.default.number().min(1).required(),
});
const confirmSurvey = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
    status: joi_1.default.alternatives()
        .try(joi_1.default.boolean(), joi_1.default.string().valid('true', 'false'))
        .required(),
});
const removeSurvey = joi_1.default.object({
    _id: joi_1.default.string().hex().length(24).required(),
});
const searchSurvey = joi_1.default.object({
    searchParameter: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.number()),
    status: joi_1.default.alternatives().try(joi_1.default.boolean(), joi_1.default.string().valid('true', 'false')),
    page: joi_1.default.number().min(1),
    perPage: joi_1.default.number().min(1),
});
exports.default = {
    getAvailableAppointmentTimes,
    create,
    update,
    search,
    remove,
    uploadImage,
    deleteImage,
    createEstimate,
    deleteEstimate,
    createSurvey,
    confirmSurvey,
    removeSurvey,
    searchSurvey,
};
