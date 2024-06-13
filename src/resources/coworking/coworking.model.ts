import { Schema, model, Types } from 'mongoose';
import Coworking, { Service } from './coworking.interface';

const CoworkingSchema = new Schema(
    {
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
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Users',
        },
        service: {
            type: Array<Service>,
            default: [],
        },
        estimate: {
            type: [
                {
                    _id: {
                        type: Types.ObjectId,
                        default: () => new Types.ObjectId(),
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
            type: Array<String>,
            default: [],
        },
        survey: {
            type: [
                {
                    _id: {
                        type: Types.ObjectId,
                        default: () => new Types.ObjectId(),
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
    },
    {
        timestamps: true,
    }
);

// CoworkingSchema.pre('save', async function (next) {
//     if (this.isModified('survey') && this.survey.length > 0) {
//         const newSurveyEntry = this.survey[0];
//         try {
//             const result = await model<Coworking>('Coworkings').aggregate([
//                 { $unwind: '$survey' },
//                 {
//                     $group: {
//                         _id: null,
//                         maxCode: { $max: '$survey.code' },
//                     },
//                 },
//             ]);
//             const maxCode =
//                 result.length > 0 && result[0].maxCode
//                     ? result[0].maxCode + 1
//                     : 100;

//             newSurveyEntry.code = maxCode;
//         } catch (error: any) {
//             throw new Error(error.message);
//         }
//     }
//     next();
// });

export default model<Coworking>('Coworkings', CoworkingSchema);
