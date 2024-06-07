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
const coworking_model_1 = __importDefault(require("@/resources/coworking/coworking.model"));
const dayjs_1 = __importDefault(require("dayjs"));
const file_service_1 = __importDefault(require("@/resources/file/file.service"));
const mailer_service_1 = __importDefault(require("@/resources/mailer/mailer.service"));
class CoworkingService {
    constructor() {
        this.coworking = coworking_model_1.default;
        this.fileService = new file_service_1.default();
        this.mailerService = new mailer_service_1.default();
    }
    // public async getAvailableAppointmentTimes(
    //     _id: Schema.Types.ObjectId,
    //     date: Date,
    //     seatsNumber: number
    // ): Promise<AvailableAppointmentTimes[] | Error> {
    //     try {
    //         const coworking: Coworking = await this.coworking
    //             .findById(_id)
    //             .lean();
    //         if (!coworking) {
    //             throw new Error('Unable to find coworking with that data');
    //         }
    //         const appointmentTimes: AvailableAppointmentTimes[] = [];
    //         const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    //         const surveyForDate = coworking.survey.filter(
    //             (survey) =>
    //                 survey.date.getTime() === date.getTime() &&
    //                 survey.status === true
    //         );
    //         const workScheduleForDay = coworking.workSchedule.find(
    //             (schedule) => schedule.day === dayOfWeek
    //         );
    //         for (let i = 0; i < 24; i++) {
    //             const timeString = `${String(i).padStart(2, '0')}:00`;
    //             const milliseconds = this.timeStringToMilliseconds(timeString);
    //             const overlappingAppointments = surveyForDate.filter(
    //                 (survey) =>
    //                     survey.startTime <= milliseconds &&
    //                     survey.endTime > milliseconds
    //             );
    //             const totalSeatsOccupied = overlappingAppointments.reduce(
    //                 (acc, curr) => acc + curr.numberSeats,
    //                 0
    //             );
    //             const disable =
    //                 totalSeatsOccupied + seatsNumber > 50 ||
    //                 overlappingAppointments.length > 0 ||
    //                 !workScheduleForDay ||
    //                 !workScheduleForDay.isWorkingDay ||
    //                 (workScheduleForDay.startWorkTime !== undefined &&
    //                     milliseconds < workScheduleForDay.startWorkTime) ||
    //                 (workScheduleForDay.endWorkTime !== undefined &&
    //                     milliseconds >= workScheduleForDay.endWorkTime);
    //             appointmentTimes.push({ time: timeString, disable });
    //         }
    //         return appointmentTimes;
    //     } catch (error: any) {
    //         throw new Error(error.message);
    //     }
    // }
    getAvailableAppointmentTimes(_id, date, seatsNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworking = yield this.coworking
                    .findById(_id)
                    .lean();
                if (!coworking) {
                    throw new Error('Unable to find coworking with that data');
                }
                const appointmentTimes = [];
                const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
                const surveyForDate = coworking.survey.filter((survey) => survey.date.getTime() === date.getTime());
                const workScheduleForDay = coworking.workSchedule.find((schedule) => schedule.day === dayOfWeek);
                for (let i = 0; i < 24; i++) {
                    const timeString = `${String(i).padStart(2, '0')}:00`;
                    const milliseconds = this.timeStringToMilliseconds(timeString);
                    const overlappingAppointments = surveyForDate.filter((survey) => survey.startTime <= milliseconds &&
                        survey.endTime > milliseconds);
                    const totalSeatsOccupied = overlappingAppointments.reduce((acc, curr) => acc + curr.numberSeats, 0);
                    const disable = totalSeatsOccupied + seatsNumber > coworking.maxSeats ||
                        !workScheduleForDay ||
                        !workScheduleForDay.isWorkingDay ||
                        (workScheduleForDay.startWorkTime !== undefined &&
                            milliseconds < workScheduleForDay.startWorkTime) ||
                        (workScheduleForDay.endWorkTime !== undefined &&
                            milliseconds >= workScheduleForDay.endWorkTime);
                    appointmentTimes.push({ time: timeString, disable });
                }
                return appointmentTimes;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    create(userId, name, region, city, address, phoneNumber, email, description, price, maxSeats, service, workSchedules) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (workSchedules && workSchedules.length > 0) {
                    for (const schedule of workSchedules) {
                        if (schedule.startWorkTime &&
                            schedule.endWorkTime &&
                            schedule.isWorkingDay) {
                            const startWorkTime = this.timeStringToMilliseconds(schedule.startWorkTime);
                            const endWorkTime = this.timeStringToMilliseconds(schedule.endWorkTime);
                            if (startWorkTime >= endWorkTime) {
                                throw new Error('startWorkTime must be less than endWorkTime');
                            }
                        }
                    }
                }
                const servicesObjects = service === null || service === void 0 ? void 0 : service.map((name) => ({
                    name,
                }));
                const convertedWorkSchedules = workSchedules === null || workSchedules === void 0 ? void 0 : workSchedules.map((schedule) => ({
                    day: schedule.day,
                    startWorkTime: schedule.endWorkTime &&
                        schedule.startWorkTime &&
                        schedule.isWorkingDay
                        ? this.timeStringToMilliseconds(schedule.startWorkTime)
                        : undefined,
                    endWorkTime: schedule.endWorkTime &&
                        schedule.startWorkTime &&
                        schedule.isWorkingDay
                        ? this.timeStringToMilliseconds(schedule.endWorkTime)
                        : undefined,
                    isWorkingDay: !schedule.endWorkTime || !schedule.startWorkTime
                        ? false
                        : schedule.isWorkingDay,
                }));
                const coworking = yield this.coworking.create({
                    userId,
                    name,
                    region,
                    city,
                    address,
                    phoneNumber,
                    email,
                    description,
                    price,
                    maxSeats,
                    service: servicesObjects,
                    workSchedule: convertedWorkSchedules,
                });
                if (!coworking) {
                    throw new Error('Failed to create coworking');
                }
                return coworking;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    update(_id, userId, name, region, city, address, phoneNumber, email, description, price, maxSeats, service, workSchedules) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (workSchedules && workSchedules.length > 0) {
                    for (const schedule of workSchedules) {
                        if (schedule.startWorkTime &&
                            schedule.endWorkTime &&
                            schedule.isWorkingDay) {
                            const startWorkTime = this.timeStringToMilliseconds(schedule.startWorkTime);
                            const endWorkTime = this.timeStringToMilliseconds(schedule.endWorkTime);
                            if (startWorkTime >= endWorkTime) {
                                throw new Error('startWorkTime must be less than endWorkTime');
                            }
                        }
                    }
                }
                const coworkingExists = yield this.coworking.findById(_id);
                if (!coworkingExists) {
                    throw new Error('Unable to find coworking');
                }
                if (coworkingExists.userId.toString() !== userId.toString()) {
                    throw new Error('No access');
                }
                const servicesObjects = service === null || service === void 0 ? void 0 : service.map((name) => ({
                    name,
                }));
                const convertedWorkSchedules = workSchedules === null || workSchedules === void 0 ? void 0 : workSchedules.map((schedule) => ({
                    day: schedule.day,
                    startWorkTime: schedule.endWorkTime &&
                        schedule.startWorkTime &&
                        schedule.isWorkingDay
                        ? this.timeStringToMilliseconds(schedule.startWorkTime)
                        : undefined,
                    endWorkTime: schedule.endWorkTime &&
                        schedule.startWorkTime &&
                        schedule.isWorkingDay
                        ? this.timeStringToMilliseconds(schedule.endWorkTime)
                        : undefined,
                    isWorkingDay: !schedule.endWorkTime || !schedule.startWorkTime
                        ? false
                        : schedule.isWorkingDay,
                }));
                const coworking = yield this.coworking
                    .findByIdAndUpdate(_id, {
                    name,
                    region,
                    city,
                    address,
                    phoneNumber,
                    email,
                    description,
                    price,
                    maxSeats,
                    service: servicesObjects,
                    workSchedule: convertedWorkSchedules,
                }, { new: true })
                    .lean();
                if (!coworking) {
                    throw new Error('Unable to update coworking with that data');
                }
                const averageRating = this.calculateAverageRating(coworking.estimate);
                return Object.assign(Object.assign({}, coworking), { averageRating });
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    getOneById(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworking = yield this.coworking.findById(_id).lean();
                if (!coworking) {
                    throw new Error('Unable to find coworking with that data');
                }
                const averageRating = this.calculateAverageRating(coworking.estimate);
                const workScheduleStringTime = coworking.workSchedule.map((schedule) => {
                    return Object.assign(Object.assign({}, schedule), { startWorkTime: schedule.startWorkTime
                            ? this.millisecondsToTimeString(schedule.startWorkTime)
                            : undefined, endWorkTime: schedule.endWorkTime
                            ? this.millisecondsToTimeString(schedule.endWorkTime)
                            : undefined });
                });
                return Object.assign(Object.assign({}, coworking), { workSchedule: workScheduleStringTime, averageRating });
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    search(searchOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filter = {};
                if (searchOptions.searchParameter) {
                    filter.$or = [
                        {
                            name: {
                                $regex: new RegExp(searchOptions.searchParameter, 'i'),
                            },
                        },
                        {
                            city: {
                                $regex: new RegExp(searchOptions.searchParameter, 'i'),
                            },
                        },
                    ];
                }
                if (searchOptions.filterOptionMinPrice ||
                    searchOptions.filterOptionMaxPrice) {
                    filter.price = {};
                    if (searchOptions.filterOptionMinPrice) {
                        filter.price.$gte = searchOptions.filterOptionMinPrice;
                    }
                    if (searchOptions.filterOptionMaxPrice) {
                        filter.price.$lte = searchOptions.filterOptionMaxPrice;
                    }
                }
                const coworkings = yield this.coworking
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .populate('userId', 'email')
                    .lean();
                if (!coworkings) {
                    throw new Error('Unable to find coworkings with that data');
                }
                const coworkingsWithRating = yield Promise.all(coworkings.map((coworking) => __awaiter(this, void 0, void 0, function* () {
                    const averageRating = this.calculateAverageRating(coworking.estimate);
                    return Object.assign(Object.assign({}, coworking), { averageRating });
                })));
                const filterOptionRating = typeof searchOptions.filterOptionRating === 'number'
                    ? [searchOptions.filterOptionRating]
                    : searchOptions.filterOptionRating;
                let filteredCoworkings = coworkingsWithRating;
                if (filterOptionRating &&
                    filterOptionRating.length > 0 &&
                    Array.isArray(filterOptionRating)) {
                    filteredCoworkings = coworkingsWithRating.filter((coworking) => filterOptionRating.includes(coworking.averageRating));
                }
                let page = 1;
                let perPage = 25;
                if (searchOptions.page && !isNaN(searchOptions.page)) {
                    page = parseInt(searchOptions.page);
                }
                if (searchOptions.perPage && !isNaN(searchOptions.perPage)) {
                    perPage = parseInt(searchOptions.perPage);
                }
                const skip = (page - 1) * perPage;
                const paginatedCoworkings = filteredCoworkings
                    .slice(skip, skip + perPage)
                    .map((coworking) => {
                    const workSchedule = coworking.workSchedule.map((schedule) => {
                        return Object.assign(Object.assign({}, schedule), { startWorkTime: schedule.startWorkTime
                                ? this.millisecondsToTimeString(schedule.startWorkTime)
                                : undefined, endWorkTime: schedule.endWorkTime
                                ? this.millisecondsToTimeString(schedule.endWorkTime)
                                : undefined });
                    });
                    return Object.assign(Object.assign({}, coworking), { workSchedule });
                });
                const totalPages = Math.ceil(filteredCoworkings.length / perPage);
                return {
                    data: paginatedCoworkings,
                    totalPages,
                    total: filteredCoworkings.length,
                };
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    adminSearch(userId, searchOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filter = { userId };
                if (searchOptions.searchParameter) {
                    filter.$or = [
                        {
                            name: {
                                $regex: new RegExp(searchOptions.searchParameter, 'i'),
                            },
                        },
                        {
                            city: {
                                $regex: new RegExp(searchOptions.searchParameter, 'i'),
                            },
                        },
                    ];
                }
                if (searchOptions.filterOptionMinPrice ||
                    searchOptions.filterOptionMaxPrice) {
                    filter.price = {};
                    if (searchOptions.filterOptionMinPrice) {
                        filter.price.$gte = searchOptions.filterOptionMinPrice;
                    }
                    if (searchOptions.filterOptionMaxPrice) {
                        filter.price.$lte = searchOptions.filterOptionMaxPrice;
                    }
                }
                const coworkings = yield this.coworking
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .populate('userId', 'email')
                    .lean();
                if (!coworkings) {
                    throw new Error('Unable to find coworkings with that data');
                }
                const coworkingsWithRating = yield Promise.all(coworkings.map((coworking) => __awaiter(this, void 0, void 0, function* () {
                    const averageRating = this.calculateAverageRating(coworking.estimate);
                    return Object.assign(Object.assign({}, coworking), { averageRating });
                })));
                let filteredCoworkings = coworkingsWithRating;
                if (searchOptions.filterOptionRating &&
                    searchOptions.filterOptionRating.length > 0 &&
                    Array.isArray(searchOptions.filterOptionRating)) {
                    filteredCoworkings = coworkingsWithRating.filter((coworking) => searchOptions.filterOptionRating.includes(coworking.averageRating));
                }
                let page = 1;
                let perPage = 25;
                if (searchOptions.page && !isNaN(searchOptions.page)) {
                    page = parseInt(searchOptions.page);
                }
                if (searchOptions.perPage && !isNaN(searchOptions.perPage)) {
                    perPage = parseInt(searchOptions.perPage);
                }
                const skip = (page - 1) * perPage;
                const paginatedCoworkings = filteredCoworkings
                    .slice(skip, skip + perPage)
                    .map((coworking) => {
                    const workSchedule = coworking.workSchedule.map((schedule) => {
                        return Object.assign(Object.assign({}, schedule), { startWorkTime: schedule.startWorkTime
                                ? this.millisecondsToTimeString(schedule.startWorkTime)
                                : undefined, endWorkTime: schedule.endWorkTime
                                ? this.millisecondsToTimeString(schedule.endWorkTime)
                                : undefined });
                    });
                    return Object.assign(Object.assign({}, coworking), { workSchedule });
                });
                const totalPages = Math.ceil(filteredCoworkings.length / perPage);
                return {
                    data: paginatedCoworkings,
                    totalPages,
                    total: filteredCoworkings.length,
                };
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    getMinMaxCoworkingPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const priceRange = yield this.coworking
                    .aggregate([
                    {
                        $group: {
                            _id: null,
                            minPrice: { $min: '$price' },
                            maxPrice: { $max: '$price' },
                        },
                    },
                ])
                    .exec();
                if (!priceRange || priceRange.length === 0) {
                    throw new Error('No coworking data found');
                }
                return {
                    minPrice: priceRange[0].minPrice,
                    maxPrice: priceRange[0].maxPrice,
                };
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    getMinMaxCoworkingPriceAdmin(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const priceRange = yield this.coworking
                    .aggregate([
                    {
                        $match: { userId },
                    },
                    {
                        $group: {
                            _id: null,
                            minPrice: { $min: '$price' },
                            maxPrice: { $max: '$price' },
                        },
                    },
                ])
                    .exec();
                if (!priceRange || priceRange.length === 0) {
                    throw new Error('No coworking data found for the specified user');
                }
                return {
                    minPrice: priceRange[0].minPrice,
                    maxPrice: priceRange[0].maxPrice,
                };
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    remove(_id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworkingExists = yield this.coworking.findById(_id);
                if (!coworkingExists) {
                    throw new Error('Unable to find coworking');
                }
                if (coworkingExists.userId.toString() !== userId.toString()) {
                    throw new Error('No access');
                }
                const coworking = yield this.coworking.findByIdAndDelete(_id);
                if (!coworking) {
                    throw new Error('Unable to delete coworking with that data');
                }
                yield Promise.all(coworking.images.map((path) => __awaiter(this, void 0, void 0, function* () {
                    yield this.fileService.removeFile(path);
                })));
                return coworking;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    uploadImage(_id, file, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworkingExists = yield this.coworking.findById(_id);
                if (!coworkingExists) {
                    throw new Error('Unable to find coworking');
                }
                if (coworkingExists.userId.toString() !== userId.toString()) {
                    throw new Error('No access');
                }
                const path = yield this.fileService.saveFile(file);
                yield this.coworking.findByIdAndUpdate(_id, { $push: { images: path } }, { new: true });
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    deleteImage(_id, path, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworkingExists = yield this.coworking.findById(_id);
                if (!coworkingExists) {
                    throw new Error('Unable to find coworking');
                }
                if (coworkingExists.userId.toString() !== userId.toString()) {
                    throw new Error('No access');
                }
                yield this.fileService.removeFile(path);
                yield this.coworking.findByIdAndUpdate(_id, { $pull: { images: path } }, { new: true });
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    createEstimate(userId, rating, review, _id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworkingExists = yield this.coworking.findById(_id);
                if (!coworkingExists) {
                    throw new Error('Unable to find coworking');
                }
                const newEstimate = {
                    userId,
                    rating,
                    review,
                };
                coworkingExists.estimate.unshift(newEstimate);
                yield coworkingExists.save();
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    deleteEstimate(_id, estimateId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworkingExists = yield this.coworking.findById(_id);
                if (!coworkingExists) {
                    throw new Error('Unable to find coworking');
                }
                const estimateIndex = coworkingExists.estimate.findIndex((estimate) => estimate._id.equals(estimateId));
                if (estimateIndex === -1) {
                    throw new Error('Unable to find estimate');
                }
                if (coworkingExists.estimate[estimateIndex].userId.toString() !==
                    userId.toString()) {
                    throw new Error('No access');
                }
                coworkingExists.estimate.splice(estimateIndex, 1);
                yield coworkingExists.save();
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    createSurvey(_id, userId, name, email, phoneNumber, date, startTime, endTime, numberSeats) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const availableTimesOrError = yield this.getAvailableAppointmentTimes(_id, date, numberSeats);
                if (availableTimesOrError instanceof Error) {
                    throw new Error(availableTimesOrError.message);
                }
                const availableTimes = availableTimesOrError;
                const requestedStartTime = this.timeStringToMilliseconds(startTime);
                const requestedEndTime = this.timeStringToMilliseconds(endTime);
                for (let time = requestedStartTime; time < requestedEndTime; time += 3600 * 1000) {
                    const timeString = this.millisecondsToTimeString(time);
                    const timeIndex = availableTimes.findIndex((time) => time.time === timeString);
                    if (timeIndex === -1 || availableTimes[timeIndex].disable) {
                        throw new Error(`Requested time ${timeString} is not available for booking`);
                    }
                }
                const coworking = yield this.coworking.findById(_id);
                if (!coworking) {
                    throw new Error('Coworking not found');
                }
                const newSurvey = {
                    userId,
                    status: false,
                    name,
                    email,
                    phoneNumber,
                    date,
                    startTime: requestedStartTime,
                    endTime: requestedEndTime,
                    numberSeats,
                };
                coworking.survey.unshift(newSurvey);
                yield coworking.save();
                return newSurvey;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    confirmSurvey(userId, _id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworking = yield this.coworking.findOne({
                    'survey._id': _id,
                });
                if (!coworking) {
                    throw new Error('Coworking not found');
                }
                if (coworking.userId.toString() !== userId.toString()) {
                    throw new Error('No access');
                }
                const surveyIndex = coworking.survey.findIndex((survey) => survey._id.toString() === _id.toString());
                if (surveyIndex === -1) {
                    throw new Error('Survey not found');
                }
                const foundedCoworking = coworking.survey[surveyIndex];
                if (foundedCoworking.status) {
                    throw new Error('Survey already confirmed');
                }
                if (typeof status === 'string') {
                    foundedCoworking.status = status === 'true';
                }
                else if (typeof status === 'boolean') {
                    foundedCoworking.status = status;
                }
                if (status) {
                    yield coworking.save();
                    yield this.mailerService.sendMail(true, coworking.name, foundedCoworking.email, foundedCoworking.name, foundedCoworking.phoneNumber, (0, dayjs_1.default)(foundedCoworking.date).format('DD MMM YYYY'), this.millisecondsToTimeString(foundedCoworking.startTime), this.millisecondsToTimeString(foundedCoworking.endTime), foundedCoworking.numberSeats, parseFloat((foundedCoworking.numberSeats *
                        coworking.price *
                        this.calculateHours(foundedCoworking.startTime, foundedCoworking.endTime)).toFixed(2)), foundedCoworking.code);
                }
                return foundedCoworking;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    removeSurvey(userId, _id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworking = yield this.coworking.findOne({
                    'survey._id': _id,
                });
                if (!coworking) {
                    throw new Error('Coworking not found');
                }
                if (coworking.userId.toString() !== userId.toString()) {
                    throw new Error('No access');
                }
                const surveyIndex = coworking.survey.findIndex((survey) => survey._id.toString() === _id.toString());
                if (surveyIndex === -1) {
                    throw new Error('Survey not found');
                }
                const foundedCoworking = coworking.survey[surveyIndex];
                if (foundedCoworking.status) {
                    throw new Error('Survey already confirmed');
                }
                coworking.survey.splice(surveyIndex, 1);
                yield coworking.save();
                yield this.mailerService.sendMail(false, coworking.name, foundedCoworking.email, foundedCoworking.name, foundedCoworking.phoneNumber, (0, dayjs_1.default)(foundedCoworking.date).format('DD MMM YYYY'), this.millisecondsToTimeString(foundedCoworking.startTime), this.millisecondsToTimeString(foundedCoworking.endTime), foundedCoworking.numberSeats, parseFloat((foundedCoworking.numberSeats *
                    coworking.price *
                    this.calculateHours(foundedCoworking.startTime, foundedCoworking.endTime)).toFixed(2)));
                return foundedCoworking;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    getOneSurveyById(userId, _id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const coworking = yield this.coworking
                    .findOne({
                    'survey._id': _id,
                })
                    .lean();
                if (!coworking) {
                    throw new Error('Coworking not found');
                }
                if (coworking.userId.toString() !== userId.toString()) {
                    throw new Error('No access');
                }
                const surveyIndex = coworking.survey.findIndex((survey) => survey._id.toString() === _id.toString());
                if (surveyIndex === -1) {
                    throw new Error('Survey not found');
                }
                return Object.assign(Object.assign({}, coworking.survey[surveyIndex]), { coworkingName: coworking.name });
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    searchSurvey(userId, searchOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filter = { userId };
                if (searchOptions.searchParameter !== undefined &&
                    searchOptions.searchParameter !== null &&
                    searchOptions.searchParameter !== '') {
                    if (typeof searchOptions.searchParameter === 'string') {
                        filter['name'] = {
                            $regex: new RegExp(searchOptions.searchParameter, 'i'),
                        };
                    }
                }
                const coworkingSpaces = yield this.coworking
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .lean();
                let filteredSurveys = coworkingSpaces
                    .map((space) => space.survey)
                    .flat();
                if (searchOptions.searchParameter !== undefined &&
                    searchOptions.searchParameter !== null) {
                    if (typeof searchOptions.searchParameter === 'number') {
                        filteredSurveys = filteredSurveys.filter((survey) => survey.code ===
                            parseInt(searchOptions.searchParameter));
                    }
                }
                if (searchOptions.status !== undefined &&
                    searchOptions.status !== null) {
                    if (typeof searchOptions.status === 'string') {
                        const status = searchOptions.status.toLowerCase();
                        filteredSurveys = filteredSurveys.filter((survey) => survey.status === (status === 'true'));
                    }
                    else if (typeof searchOptions.status === 'boolean') {
                        filteredSurveys = filteredSurveys.filter((survey) => survey.status === searchOptions.status);
                    }
                }
                filteredSurveys.sort((a, b) => {
                    return a.status === b.status ? 0 : a.status ? 1 : -1;
                });
                let page = 1;
                let perPage = 25;
                if (searchOptions.page && !isNaN(searchOptions.page)) {
                    page = parseInt(searchOptions.page);
                }
                if (searchOptions.perPage && !isNaN(searchOptions.perPage)) {
                    perPage = parseInt(searchOptions.perPage);
                }
                const skip = (page - 1) * perPage;
                const paginatedCoworkings = filteredSurveys
                    .slice(skip, skip + perPage)
                    .map((survey) => {
                    const coworking = coworkingSpaces.find((space) => space.survey.some((s) => s._id.equals(survey._id)));
                    if (coworking) {
                        return Object.assign(Object.assign({}, survey), { coworkingName: coworking.name });
                    }
                    return { survey };
                });
                const totalPages = Math.ceil(filteredSurveys.length / perPage);
                return {
                    data: paginatedCoworkings,
                    totalPages,
                    total: filteredSurveys.length,
                };
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    timeStringToMilliseconds(time) {
        const parts = time.split(':');
        let hours = parseInt(parts[0]);
        let minutes = parts.length > 1 ? parseInt(parts[1]) : 0;
        return (hours * 3600 + minutes * 60) * 1000;
    }
    millisecondsToTimeString(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const hoursString = String(hours).padStart(2, '0');
        const minutesString = String(minutes).padStart(2, '0');
        return `${hoursString}:${minutesString}`;
    }
    calculateAverageRating(estimate) {
        if (estimate.length === 0)
            return 0;
        const totalRating = estimate.reduce((sum, current) => sum + current.rating, 0);
        return Math.floor(totalRating / estimate.length);
    }
    calculateHours(milliseconds1, milliseconds2) {
        const milliseconds = milliseconds2 - milliseconds1;
        const hours = milliseconds / (1000 * 60 * 60);
        return parseFloat(hours.toFixed(1));
    }
}
exports.default = CoworkingService;
