import { DaysEnum } from '@/utils/enums/days.enum';
import Joi from 'joi';
import parsePhoneNumberFromString from 'libphonenumber-js';

const getAvailableAppointmentTimes = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    date: Joi.date().required(),
    seatsNumber: Joi.number().min(1).required(),
});

const create = Joi.object({
    name: Joi.string().min(1).max(150).required(),
    region: Joi.string().min(1).max(150).required(),
    city: Joi.string().min(1).max(150).required(),
    address: Joi.string().min(1).max(255).required(),
    phoneNumber: Joi.custom((value, helpers) => {
        if (!parsePhoneNumberFromString(value)?.isValid()) {
            return helpers.error('Invalid phone number format');
        }
        return value;
    }).required(),
    email: Joi.string().email().min(1).max(255),
    description: Joi.string().min(1).required(),
    price: Joi.number().min(0).required(),
    maxSeats: Joi.number().min(1).required(),
    service: Joi.array().min(3).items(Joi.string()),
    workSchedule: Joi.array().items(
        Joi.object({
            day: Joi.string()
                .valid(
                    DaysEnum.MONDAY,
                    DaysEnum.TUESDAY,
                    DaysEnum.WEDNESDAY,
                    DaysEnum.THURSDAY,
                    DaysEnum.FRIDAY,
                    DaysEnum.SATURDAY,
                    DaysEnum.SUNDAY
                )
                .required(),
            startWorkTime: Joi.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
            endWorkTime: Joi.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
            isWorkingDay: Joi.bool().default(true),
        })
    ),
});
const update = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    name: Joi.string().min(1).max(150),
    region: Joi.string().min(1).max(150),
    city: Joi.string().min(1).max(150),
    address: Joi.string().min(1).max(255),
    phoneNumber: Joi.custom((value, helpers) => {
        if (!parsePhoneNumberFromString(value)?.isValid()) {
            return helpers.error('Invalid phone number format');
        }
        return value;
    }).allow(null),
    email: Joi.string().email().min(1).max(255).allow(null),
    description: Joi.string().min(1),
    price: Joi.number().min(0),
    maxSeats: Joi.number().min(1),
    service: Joi.array().min(3).items(Joi.string()),
    workSchedule: Joi.array().items(
        Joi.object({
            day: Joi.string()
                .valid(
                    DaysEnum.MONDAY,
                    DaysEnum.TUESDAY,
                    DaysEnum.WEDNESDAY,
                    DaysEnum.THURSDAY,
                    DaysEnum.FRIDAY,
                    DaysEnum.SATURDAY,
                    DaysEnum.SUNDAY
                )
                .required(),
            startWorkTime: Joi.string()
                .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
                .allow('', null),
            endWorkTime: Joi.string()
                .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
                .allow('', null),
            isWorkingDay: Joi.bool().default(true),
        })
    ),
});
const search = Joi.object({
    filterOptionRating: Joi.alternatives().try(Joi.array().items(Joi.number().min(0).max(5)), Joi.number()),
    filterOptionMinPrice: Joi.number().min(0),
    filterOptionMaxPrice: Joi.number().min(0),
    searchParameter: Joi.alternatives().try(Joi.string(), Joi.number()),
    page: Joi.number().min(1),
    perPage: Joi.number().min(1),
}).custom((value, helpers) => {
    const minPrice = value.filterOptionMinPrice;
    const maxPrice = value.filterOptionMaxPrice;

    if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice >= maxPrice
    ) {
        return helpers.error('Min price must be greater than max price');
    }

    return value;
}, 'Min price must be greater than max price');
const remove = Joi.object({
    _id: Joi.string().hex().length(24).required(),
});

const uploadImage = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    file: Joi.object(),
});
const deleteImage = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    path: Joi.string().required(),
});

const createEstimate = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    userId: Joi.string().length(36).required(),
    rating: Joi.number().min(1).max(5).required(),
    review: Joi.string().default(''),
});
const deleteEstimate = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    estimateId: Joi.string().hex().length(24).required(),
    userId: Joi.string().length(36).required(),
});

const createSurvey = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    userId: Joi.string().length(36).required(),
    name: Joi.alternatives()
        .try(Joi.number(), Joi.string().min(1).max(150))
        .required(),
    email: Joi.string().email().min(1).max(255).required(),
    phoneNumber: Joi.custom((value, helpers) => {
        if (!parsePhoneNumberFromString(value)?.isValid()) {
            return helpers.error('Invalid phone number format');
        }
        return value;
    }).required(),
    date: Joi.date().required(),
    startTime: Joi.string()
        .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
        .required(),
    endTime: Joi.string()
        .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
        .required(),
    numberSeats: Joi.number().min(1).required(),
});
const confirmSurvey = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    status: Joi.alternatives()
        .try(Joi.boolean(), Joi.string().valid('true', 'false'))
        .required(),
});
const removeSurvey = Joi.object({
    _id: Joi.string().hex().length(24).required(),
});
const searchSurvey = Joi.object({
    searchParameter: Joi.alternatives().try(Joi.string(), Joi.number()),
    status: Joi.alternatives().try(
        Joi.boolean(),
        Joi.string().valid('true', 'false')
    ),
    page: Joi.number().min(1),
    perPage: Joi.number().min(1),
});

export default {
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
