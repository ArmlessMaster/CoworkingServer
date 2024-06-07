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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CoworkingSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    region: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
    },
    maxSeats: {
        type: Number,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Users',
    },
    service: {
        type: (Array),
        default: [],
    },
    estimate: {
        type: [
            {
                _id: {
                    type: mongoose_1.Types.ObjectId,
                    default: () => new mongoose_1.Types.ObjectId(),
                },
                userId: String,
                rating: Number,
                review: String,
            },
        ],
        default: [],
    },
    workSchedule: {
        type: [
            {
                day: String,
                startWorkTime: Number,
                endWorkTime: Number,
                isWorkingDay: {
                    type: Boolean,
                    required: true,
                    default: true,
                },
            },
        ],
        default: [],
    },
    images: {
        type: (Array),
        default: [],
    },
    survey: {
        type: [
            {
                _id: {
                    type: mongoose_1.Types.ObjectId,
                    default: () => new mongoose_1.Types.ObjectId(),
                },
                userId: String,
                status: Boolean,
                name: String,
                email: String,
                phoneNumber: String,
                date: Date,
                startTime: Number,
                endTime: Number,
                numberSeats: Number,
                code: {
                    type: Number,
                    unique: true,
                    sparse: true,
                },
            },
        ],
        default: [],
    },
}, {
    timestamps: true,
});
CoworkingSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified('survey') && this.survey.length > 0) {
            const newSurveyEntry = this.survey[this.survey.length - 1];
            if (newSurveyEntry && newSurveyEntry.code === undefined) {
                try {
                    const result = yield (0, mongoose_1.model)('Coworkings').aggregate([
                        { $unwind: '$survey' },
                        {
                            $group: {
                                _id: null,
                                maxCode: { $max: '$survey.code' },
                            },
                        },
                    ]);
                    const maxCode = result.length > 0 && result[0].maxCode
                        ? result[0].maxCode + 1
                        : 100;
                    newSurveyEntry.code = maxCode;
                }
                catch (error) {
                    throw new Error(error.message);
                }
            }
        }
        next();
    });
});
exports.default = (0, mongoose_1.model)('Coworkings', CoworkingSchema);
