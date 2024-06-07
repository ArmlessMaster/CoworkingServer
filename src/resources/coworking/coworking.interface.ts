import { Document, ObjectId } from 'mongoose';
import User from '../user/user.interface';

interface AvailableAppointmentTimes extends Object {
    time: string;
    disable: boolean;
}

interface Service extends Object {
    name: string;
}

interface Estimate extends Object {
    userId: string;
    rating: number;
    review: string;
}

interface WorkSchedule extends Object {
    day: string;
    startWorkTime?: number;
    endWorkTime?: number;
    isWorkingDay: boolean;
}

interface WorkScheduleStringTime extends Object {
    day: string;
    startWorkTime?: string;
    endWorkTime?: string;
    isWorkingDay: boolean;
}

interface Survey extends Object {
    userId: string;
    status: boolean;
    name: string;
    email: string;
    phoneNumber: string;
    date: Date;
    startTime: number;
    endTime: number;
    numberSeats: number;
    code?: number;
}

interface Coworking extends Document {
    name: string;
    region: string;
    city: string;
    address: string;
    phoneNumber: string;
    email: string;
    description: string;
    price: number;
    maxSeats: number;
    userId: ObjectId | User;
    service: Array<Service>;
    estimate: Array<Estimate>;
    workSchedule: Array<WorkSchedule>;
    images: Array<string>;
    survey: Array<Survey>;
}

interface CoworkingSearchData extends Document {
    name: string;
    region: string;
    city: string;
    address: string;
    phoneNumber: string;
    email: string;
    description: string;
    price: number;
    maxSeats: number;
    userId: ObjectId | User;
    service: Array<Service>;
    estimate: Array<Estimate>;
    workSchedule: Array<WorkSchedule>;
    images: Array<string>;
    survey: Array<Survey>;
    averageRating: number;
}

interface CoworkingSearchDataString extends Document {
    name: string;
    region: string;
    city: string;
    address: string;
    phoneNumber: string;
    email: string;
    description: string;
    price: number;
    maxSeats: number;
    userId: ObjectId | User;
    service: Array<Service>;
    estimate: Array<Estimate>;
    workSchedule: Array<WorkScheduleStringTime>;
    images: Array<string>;
    survey: Array<Survey>;
    averageRating: number;
}

interface CoworkingSearch extends Document {
    data: CoworkingSearchDataString[];
    totalPages: number;
    total: number;
}

interface SurveySearch extends Document {
    data: Survey & {coworkingName: string}[];
    totalPages: number;
    total: number;
}

export default Coworking;

export {
    AvailableAppointmentTimes,
    CoworkingSearchData,
    CoworkingSearchDataString,
    CoworkingSearch,
    SurveySearch,
    Service,
    Estimate,
    WorkSchedule,
    WorkScheduleStringTime,
    Survey,
};
