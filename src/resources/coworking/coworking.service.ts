import Coworking, {
    Service,
    Estimate,
    WorkScheduleStringTime,
    Survey,
    CoworkingSearch,
    SurveySearch,
    CoworkingSearchData,
    AvailableAppointmentTimes,
    CoworkingSearchDataString,
} from '@/resources/coworking/coworking.interface';
import CoworkingModel from '@/resources/coworking/coworking.model';
import { Schema } from 'mongoose';
import dayjs from 'dayjs';
import FileService from '@/resources/file/file.service';
import MailerService from '@/resources/mailer/mailer.service';

class CoworkingService {
    private coworking = CoworkingModel;
    private fileService = new FileService();
    private mailerService = new MailerService();

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
    public async getAvailableAppointmentTimes(
        _id: Schema.Types.ObjectId,
        date: Date,
        seatsNumber: number
    ): Promise<AvailableAppointmentTimes[] | Error> {
        try {
            const coworking: Coworking = await this.coworking
                .findById(_id)
                .lean();

            if (!coworking) {
                throw new Error('Unable to find coworking with that data');
            }

            const appointmentTimes: AvailableAppointmentTimes[] = [];

            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
            const surveyForDate = coworking.survey.filter(
                (survey) => survey.date.getTime() === date.getTime()
            );

            const workScheduleForDay = coworking.workSchedule.find(
                (schedule) => schedule.day === dayOfWeek
            );

            for (let i = 0; i < 24; i++) {
                const timeString = `${String(i).padStart(2, '0')}:00`;
                const milliseconds = this.timeStringToMilliseconds(timeString);
                const overlappingAppointments = surveyForDate.filter(
                    (survey) =>
                        survey.startTime <= milliseconds &&
                        survey.endTime > milliseconds
                );

                const totalSeatsOccupied = overlappingAppointments.reduce(
                    (acc, curr) => acc + curr.numberSeats,
                    0
                );

                const disable =
                    totalSeatsOccupied + seatsNumber > coworking.maxSeats ||
                    !workScheduleForDay ||
                    !workScheduleForDay.isWorkingDay ||
                    (workScheduleForDay.startWorkTime !== undefined &&
                        milliseconds < workScheduleForDay.startWorkTime) ||
                    (workScheduleForDay.endWorkTime !== undefined &&
                        milliseconds >= workScheduleForDay.endWorkTime);

                appointmentTimes.push({ time: timeString, disable });
            }

            return appointmentTimes;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async create(
        userId: Schema.Types.ObjectId,
        name: string,
        region: string,
        city: string,
        address: string,
        phoneNumber: string,
        email: string,
        description: string,
        price: number,
        maxSeats: number,
        service: string[],
        workSchedules: WorkScheduleStringTime[]
    ): Promise<Coworking | Error> {
        try {
            if (workSchedules && workSchedules.length > 0) {
                for (const schedule of workSchedules) {
                    if (
                        schedule.startWorkTime &&
                        schedule.endWorkTime &&
                        schedule.isWorkingDay
                    ) {
                        const startWorkTime = this.timeStringToMilliseconds(
                            schedule.startWorkTime
                        );
                        const endWorkTime = this.timeStringToMilliseconds(
                            schedule.endWorkTime
                        );

                        if (startWorkTime >= endWorkTime) {
                            throw new Error(
                                'startWorkTime must be less than endWorkTime'
                            );
                        }
                    }
                }
            }

            const servicesObjects: Service[] = service?.map((name) => ({
                name,
            }));
            const convertedWorkSchedules = workSchedules?.map((schedule) => ({
                day: schedule.day,
                startWorkTime:
                    schedule.endWorkTime &&
                    schedule.startWorkTime &&
                    schedule.isWorkingDay
                        ? this.timeStringToMilliseconds(schedule.startWorkTime)
                        : undefined,
                endWorkTime:
                    schedule.endWorkTime &&
                    schedule.startWorkTime &&
                    schedule.isWorkingDay
                        ? this.timeStringToMilliseconds(schedule.endWorkTime)
                        : undefined,
                isWorkingDay:
                    !schedule.endWorkTime || !schedule.startWorkTime
                        ? false
                        : schedule.isWorkingDay,
            }));

            const coworking = await this.coworking.create({
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
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async update(
        _id: Schema.Types.ObjectId,
        userId: Schema.Types.ObjectId,
        name: string,
        region: string,
        city: string,
        address: string,
        phoneNumber: string,
        email: string,
        description: string,
        price: number,
        maxSeats: number,
        service: string[],
        workSchedules: WorkScheduleStringTime[]
    ): Promise<Coworking | Error> {
        try {
            if (workSchedules && workSchedules.length > 0) {
                for (const schedule of workSchedules) {
                    if (
                        schedule.startWorkTime &&
                        schedule.endWorkTime &&
                        schedule.isWorkingDay
                    ) {
                        const startWorkTime = this.timeStringToMilliseconds(
                            schedule.startWorkTime
                        );
                        const endWorkTime = this.timeStringToMilliseconds(
                            schedule.endWorkTime
                        );

                        if (startWorkTime >= endWorkTime) {
                            throw new Error(
                                'startWorkTime must be less than endWorkTime'
                            );
                        }
                    }
                }
            }

            const coworkingExists = await this.coworking.findById(_id);

            if (!coworkingExists) {
                throw new Error('Unable to find coworking');
            }

            if (coworkingExists.userId.toString() !== userId.toString()) {
                throw new Error('No access');
            }

            const servicesObjects: Service[] = service?.map((name) => ({
                name,
            }));
            const convertedWorkSchedules = workSchedules?.map((schedule) => ({
                day: schedule.day,
                startWorkTime:
                    schedule.endWorkTime &&
                    schedule.startWorkTime &&
                    schedule.isWorkingDay
                        ? this.timeStringToMilliseconds(schedule.startWorkTime)
                        : undefined,
                endWorkTime:
                    schedule.endWorkTime &&
                    schedule.startWorkTime &&
                    schedule.isWorkingDay
                        ? this.timeStringToMilliseconds(schedule.endWorkTime)
                        : undefined,
                isWorkingDay:
                    !schedule.endWorkTime || !schedule.startWorkTime
                        ? false
                        : schedule.isWorkingDay,
            }));

            const coworking = await this.coworking
                .findByIdAndUpdate(
                    _id,
                    {
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
                    },
                    { new: true }
                )
                .lean();

            if (!coworking) {
                throw new Error('Unable to update coworking with that data');
            }

            const averageRating = this.calculateAverageRating(
                coworking.estimate
            );

            return { ...coworking, averageRating } as CoworkingSearchData;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async getOneById(
        _id: string
    ): Promise<CoworkingSearchDataString | Error> {
        try {
            const coworking = await this.coworking.findById(_id).lean();

            if (!coworking) {
                throw new Error('Unable to find coworking with that data');
            }

            const averageRating = this.calculateAverageRating(
                coworking.estimate
            );

            const workScheduleStringTime = coworking.workSchedule.map(
                (schedule) => {
                    return {
                        ...schedule,
                        startWorkTime: schedule.startWorkTime
                            ? this.millisecondsToTimeString(
                                  schedule.startWorkTime
                              )
                            : undefined,
                        endWorkTime: schedule.endWorkTime
                            ? this.millisecondsToTimeString(
                                  schedule.endWorkTime
                              )
                            : undefined,
                    };
                }
            );

            return {
                ...coworking,
                workSchedule: workScheduleStringTime,
                averageRating,
            } as CoworkingSearchDataString;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async search(searchOptions: {
        [key: string]: any;
    }): Promise<CoworkingSearch | Error> {
        try {
            let filter: any = {};

            if (searchOptions.searchParameter) {
                filter.$or = [
                    {
                        name: {
                            $regex: new RegExp(
                                searchOptions.searchParameter,
                                'i'
                            ),
                        },
                    },
                    {
                        city: {
                            $regex: new RegExp(
                                searchOptions.searchParameter,
                                'i'
                            ),
                        },
                    },
                ];
            }

            if (
                searchOptions.filterOptionMinPrice ||
                searchOptions.filterOptionMaxPrice
            ) {
                filter.price = {};
                if (searchOptions.filterOptionMinPrice) {
                    filter.price.$gte = searchOptions.filterOptionMinPrice;
                }
                if (searchOptions.filterOptionMaxPrice) {
                    filter.price.$lte = searchOptions.filterOptionMaxPrice;
                }
            }

            const coworkings = await this.coworking
                .find(filter)
                .sort({ createdAt: -1 })
                .populate('userId', 'email')
                .lean();

            if (!coworkings) {
                throw new Error('Unable to find coworkings with that data');
            }

            const coworkingsWithRating = await Promise.all(
                coworkings.map(async (coworking) => {
                    const averageRating = this.calculateAverageRating(
                        coworking.estimate
                    );
                    return { ...coworking, averageRating };
                })
            );

            const filterOptionRating =
                typeof searchOptions.filterOptionRating === 'number'
                    ? [searchOptions.filterOptionRating]
                    : searchOptions.filterOptionRating;

            let filteredCoworkings = coworkingsWithRating;
            if (
                filterOptionRating &&
                filterOptionRating.length > 0 &&
                Array.isArray(filterOptionRating)
            ) {
                filteredCoworkings = coworkingsWithRating.filter((coworking) =>
                    filterOptionRating.includes(coworking.averageRating)
                );
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
                    const workSchedule = coworking.workSchedule.map(
                        (schedule) => {
                            return {
                                ...schedule,
                                startWorkTime: schedule.startWorkTime
                                    ? this.millisecondsToTimeString(
                                          schedule.startWorkTime
                                      )
                                    : undefined,
                                endWorkTime: schedule.endWorkTime
                                    ? this.millisecondsToTimeString(
                                          schedule.endWorkTime
                                      )
                                    : undefined,
                            };
                        }
                    );
                    return { ...coworking, workSchedule };
                });
            const totalPages = Math.ceil(filteredCoworkings.length / perPage);

            return {
                data: paginatedCoworkings as CoworkingSearchData[],
                totalPages,
                total: filteredCoworkings.length,
            } as CoworkingSearch;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async adminSearch(
        userId: Schema.Types.ObjectId,
        searchOptions: {
            [key: string]: any;
        }
    ): Promise<CoworkingSearch | Error> {
        try {
            let filter: any = { userId };

            if (searchOptions.searchParameter) {
                filter.$or = [
                    {
                        name: {
                            $regex: new RegExp(
                                searchOptions.searchParameter,
                                'i'
                            ),
                        },
                    },
                    {
                        city: {
                            $regex: new RegExp(
                                searchOptions.searchParameter,
                                'i'
                            ),
                        },
                    },
                ];
            }

            if (
                searchOptions.filterOptionMinPrice ||
                searchOptions.filterOptionMaxPrice
            ) {
                filter.price = {};
                if (searchOptions.filterOptionMinPrice) {
                    filter.price.$gte = searchOptions.filterOptionMinPrice;
                }
                if (searchOptions.filterOptionMaxPrice) {
                    filter.price.$lte = searchOptions.filterOptionMaxPrice;
                }
            }

            const coworkings = await this.coworking
                .find(filter)
                .sort({ createdAt: -1 })
                .populate('userId', 'email')
                .lean();

            if (!coworkings) {
                throw new Error('Unable to find coworkings with that data');
            }

            const coworkingsWithRating = await Promise.all(
                coworkings.map(async (coworking) => {
                    const averageRating = this.calculateAverageRating(
                        coworking.estimate
                    );
                    return { ...coworking, averageRating };
                })
            );

            let filteredCoworkings = coworkingsWithRating;
            if (
                searchOptions.filterOptionRating &&
                searchOptions.filterOptionRating.length > 0 &&
                Array.isArray(searchOptions.filterOptionRating)
            ) {
                filteredCoworkings = coworkingsWithRating.filter((coworking) =>
                    searchOptions.filterOptionRating.includes(
                        coworking.averageRating
                    )
                );
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
                    const workSchedule = coworking.workSchedule.map(
                        (schedule) => {
                            return {
                                ...schedule,
                                startWorkTime: schedule.startWorkTime
                                    ? this.millisecondsToTimeString(
                                          schedule.startWorkTime
                                      )
                                    : undefined,
                                endWorkTime: schedule.endWorkTime
                                    ? this.millisecondsToTimeString(
                                          schedule.endWorkTime
                                      )
                                    : undefined,
                            };
                        }
                    );
                    return { ...coworking, workSchedule };
                });
            const totalPages = Math.ceil(filteredCoworkings.length / perPage);

            return {
                data: paginatedCoworkings as CoworkingSearchData[],
                totalPages,
                total: filteredCoworkings.length,
            } as CoworkingSearch;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async getMinMaxCoworkingPrice(): Promise<
        { minPrice: number; maxPrice: number } | Error
    > {
        try {
            const priceRange = await this.coworking
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
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async getMinMaxCoworkingPriceAdmin(
        userId: Schema.Types.ObjectId
    ): Promise<{ minPrice: number; maxPrice: number } | Error> {
        try {
            const priceRange = await this.coworking
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
                throw new Error(
                    'No coworking data found for the specified user'
                );
            }

            return {
                minPrice: priceRange[0].minPrice,
                maxPrice: priceRange[0].maxPrice,
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async remove(
        _id: Schema.Types.ObjectId,
        userId: Schema.Types.ObjectId
    ): Promise<Coworking | Error> {
        try {
            const coworkingExists = await this.coworking.findById(_id);

            if (!coworkingExists) {
                throw new Error('Unable to find coworking');
            }

            if (coworkingExists.userId.toString() !== userId.toString()) {
                throw new Error('No access');
            }

            const coworking = await this.coworking.findByIdAndDelete(_id);

            if (!coworking) {
                throw new Error('Unable to delete coworking with that data');
            }

            await Promise.all(
                coworking.images.map(async (path) => {
                    await this.fileService.removeFile(path);
                })
            );

            return coworking;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async uploadImage(
        _id: Schema.Types.ObjectId,
        file: Express.Multer.File,
        userId: Schema.Types.ObjectId
    ): Promise<void | Error> {
        try {
            const coworkingExists = await this.coworking.findById(_id);

            if (!coworkingExists) {
                throw new Error('Unable to find coworking');
            }

            if (coworkingExists.userId.toString() !== userId.toString()) {
                throw new Error('No access');
            }

            const path = await this.fileService.saveFile(file);

            await this.coworking.findByIdAndUpdate(
                _id,
                { $push: { images: path } },
                { new: true }
            );
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async deleteImage(
        _id: Schema.Types.ObjectId,
        path: string,
        userId: Schema.Types.ObjectId
    ): Promise<void | Error> {
        try {
            const coworkingExists = await this.coworking.findById(_id);

            if (!coworkingExists) {
                throw new Error('Unable to find coworking');
            }

            if (coworkingExists.userId.toString() !== userId.toString()) {
                throw new Error('No access');
            }

            await this.fileService.removeFile(path);

            await this.coworking.findByIdAndUpdate(
                _id,
                { $pull: { images: path } },
                { new: true }
            );
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async createEstimate(
        userId: string,
        rating: number,
        review: string,
        _id: Schema.Types.ObjectId
    ): Promise<void | Error> {
        try {
            const coworkingExists = await this.coworking.findById(_id);

            if (!coworkingExists) {
                throw new Error('Unable to find coworking');
            }

            const newEstimate = {
                userId,
                rating,
                review,
            };

            coworkingExists.estimate.unshift(newEstimate);
            await coworkingExists.save();
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async deleteEstimate(
        _id: Schema.Types.ObjectId,
        estimateId: Schema.Types.ObjectId,
        userId: string
    ): Promise<void | Error> {
        try {
            const coworkingExists = await this.coworking.findById(_id);

            if (!coworkingExists) {
                throw new Error('Unable to find coworking');
            }

            const estimateIndex = coworkingExists.estimate.findIndex(
                (estimate: any) => estimate._id.equals(estimateId)
            );

            if (estimateIndex === -1) {
                throw new Error('Unable to find estimate');
            }

            if (
                coworkingExists.estimate[estimateIndex].userId.toString() !==
                userId.toString()
            ) {
                throw new Error('No access');
            }

            coworkingExists.estimate.splice(estimateIndex, 1);

            await coworkingExists.save();
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async createSurvey(
        _id: Schema.Types.ObjectId,
        userId: string,
        name: string,
        email: string,
        phoneNumber: string,
        date: Date,
        startTime: string,
        endTime: string,
        numberSeats: number
    ): Promise<Survey | Error> {
        try {
            const availableTimesOrError =
                await this.getAvailableAppointmentTimes(_id, date, numberSeats);

            if (availableTimesOrError instanceof Error) {
                throw new Error(availableTimesOrError.message);
            }

            const availableTimes = availableTimesOrError;

            const requestedStartTime = this.timeStringToMilliseconds(startTime);
            const requestedEndTime = this.timeStringToMilliseconds(endTime);

            for (
                let time = requestedStartTime;
                time < requestedEndTime;
                time += 3600 * 1000
            ) {
                const timeString = this.millisecondsToTimeString(time);
                const timeIndex = availableTimes.findIndex(
                    (time) => time.time === timeString
                );

                if (timeIndex === -1 || availableTimes[timeIndex].disable) {
                    throw new Error(
                        `Requested time ${timeString} is not available for booking`
                    );
                }
            }

            const coworking = await this.coworking.findById(_id);

            if (!coworking) {
                throw new Error('Coworking not found');
            }

            const result = await this.coworking.aggregate([
                { $unwind: '$survey' },
                {
                    $group: {
                        _id: null,
                        maxCode: { $max: '$survey.code' },
                    },
                },
            ]);

            const maxCode =
                result.length > 0 && result[0].maxCode
                    ? result[0].maxCode + 1
                    : 100;

            const newSurvey: Survey = {
                userId,
                status: false,
                name,
                email,
                phoneNumber,
                date,
                startTime: requestedStartTime,
                endTime: requestedEndTime,
                numberSeats,
                code: maxCode,
            };

            coworking.survey.unshift(newSurvey);

            await coworking.save();

            return newSurvey;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async confirmSurvey(
        userId: Schema.Types.ObjectId,
        _id: Schema.Types.ObjectId,
        status: boolean
    ): Promise<Survey | Error> {
        try {
            const coworking = await this.coworking.findOne({
                'survey._id': _id,
            });

            if (!coworking) {
                throw new Error('Coworking not found');
            }

            if (coworking.userId.toString() !== userId.toString()) {
                throw new Error('No access');
            }

            const surveyIndex = (
                coworking.survey as (Survey & { _id: Schema.Types.ObjectId })[]
            ).findIndex((survey) => survey._id.toString() === _id.toString());

            if (surveyIndex === -1) {
                throw new Error('Survey not found');
            }
            const foundedCoworking = coworking.survey[surveyIndex];

            if (foundedCoworking.status) {
                throw new Error('Survey already confirmed');
            }

            if (typeof status === 'string') {
                foundedCoworking.status = status === 'true';
            } else if (typeof status === 'boolean') {
                foundedCoworking.status = status;
            }

            if (status) {
                await coworking.save();
                await this.mailerService.sendMail(
                    true,
                    coworking.name,
                    foundedCoworking.email,
                    foundedCoworking.name,
                    foundedCoworking.phoneNumber,
                    dayjs(foundedCoworking.date).format('DD MMM YYYY'),
                    this.millisecondsToTimeString(foundedCoworking.startTime),
                    this.millisecondsToTimeString(foundedCoworking.endTime),
                    foundedCoworking.numberSeats,
                    parseFloat(
                        (
                            foundedCoworking.numberSeats *
                            coworking.price *
                            this.calculateHours(
                                foundedCoworking.startTime,
                                foundedCoworking.endTime
                            )
                        ).toFixed(2)
                    ),
                    foundedCoworking.code
                );
            }

            return foundedCoworking;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async removeSurvey(
        userId: Schema.Types.ObjectId,
        _id: Schema.Types.ObjectId
    ): Promise<Survey | void | Error> {
        try {
            const coworking = await this.coworking.findOne({
                'survey._id': _id,
            });

            if (!coworking) {
                throw new Error('Coworking not found');
            }

            if (coworking.userId.toString() !== userId.toString()) {
                throw new Error('No access');
            }

            const surveyIndex = (
                coworking.survey as (Survey & { _id: Schema.Types.ObjectId })[]
            ).findIndex((survey) => survey._id.toString() === _id.toString());

            if (surveyIndex === -1) {
                throw new Error('Survey not found');
            }

            const foundedCoworking = coworking.survey[surveyIndex];

            if (foundedCoworking.status) {
                throw new Error('Survey already confirmed');
            }

            coworking.survey.splice(surveyIndex, 1);
            await coworking.save();
            await this.mailerService.sendMail(
                false,
                coworking.name,
                foundedCoworking.email,
                foundedCoworking.name,
                foundedCoworking.phoneNumber,
                dayjs(foundedCoworking.date).format('DD MMM YYYY'),
                this.millisecondsToTimeString(foundedCoworking.startTime),
                this.millisecondsToTimeString(foundedCoworking.endTime),
                foundedCoworking.numberSeats,
                parseFloat(
                    (
                        foundedCoworking.numberSeats *
                        coworking.price *
                        this.calculateHours(
                            foundedCoworking.startTime,
                            foundedCoworking.endTime
                        )
                    ).toFixed(2)
                )
            );

            return foundedCoworking;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async getOneSurveyById(
        userId: Schema.Types.ObjectId,
        _id: string
    ): Promise<(Survey & { coworkingName: string }) | Error> {
        try {
            const coworking = await this.coworking
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

            const surveyIndex = (
                coworking.survey as (Survey & { _id: Schema.Types.ObjectId })[]
            ).findIndex((survey) => survey._id.toString() === _id.toString());

            if (surveyIndex === -1) {
                throw new Error('Survey not found');
            }

            return {
                ...coworking.survey[surveyIndex],
                coworkingName: coworking.name,
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async searchSurvey(
        userId: Schema.Types.ObjectId,
        searchOptions: {
            [key: string]: any;
        }
    ): Promise<SurveySearch | Error> {
        try {
            let filter: any = { userId };

            if (
                searchOptions.searchParameter !== undefined &&
                searchOptions.searchParameter !== null &&
                searchOptions.searchParameter !== ''
            ) {
                if (typeof searchOptions.searchParameter === 'string') {
                    filter['name'] = {
                        $regex: new RegExp(searchOptions.searchParameter, 'i'),
                    };
                }
            }

            const coworkingSpaces = await this.coworking
                .find(filter)
                .sort({ createdAt: -1 })
                .lean();

            let filteredSurveys = coworkingSpaces
                .map((space) => space.survey)
                .flat() as (Survey & { _id: Schema.Types.ObjectId })[];

            if (
                searchOptions.searchParameter !== undefined &&
                searchOptions.searchParameter !== null
            ) {
                if (typeof searchOptions.searchParameter === 'number') {
                    filteredSurveys = filteredSurveys.filter(
                        (survey) =>
                            survey.code ===
                            parseInt(searchOptions.searchParameter)
                    );
                }
            }

            if (
                searchOptions.status !== undefined &&
                searchOptions.status !== null
            ) {
                if (typeof searchOptions.status === 'string') {
                    const status = searchOptions.status.toLowerCase();
                    filteredSurveys = filteredSurveys.filter(
                        (survey) => survey.status === (status === 'true')
                    );
                } else if (typeof searchOptions.status === 'boolean') {
                    filteredSurveys = filteredSurveys.filter(
                        (survey) => survey.status === searchOptions.status
                    );
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
                .map((survey: any) => {
                    const coworking = coworkingSpaces.find((space) =>
                        space.survey.some((s: any) => s._id.equals(survey._id))
                    );

                    if (coworking) {
                        return {
                            ...survey,
                            coworkingName: coworking.name,
                        };
                    }

                    return { survey };
                });
            const totalPages = Math.ceil(filteredSurveys.length / perPage);

            return {
                data: paginatedCoworkings as Survey &
                    { coworkingName: string }[],
                totalPages,
                total: filteredSurveys.length,
            } as SurveySearch;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private timeStringToMilliseconds(time: string): number {
        const parts = time.split(':');
        let hours = parseInt(parts[0]);
        let minutes = parts.length > 1 ? parseInt(parts[1]) : 0;

        return (hours * 3600 + minutes * 60) * 1000;
    }

    private millisecondsToTimeString(milliseconds: number): string {
        const totalSeconds = Math.floor(milliseconds / 1000);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        const hoursString = String(hours).padStart(2, '0');
        const minutesString = String(minutes).padStart(2, '0');

        return `${hoursString}:${minutesString}`;
    }

    private calculateAverageRating(estimate: Estimate[]): number {
        if (estimate.length === 0) return 0;

        const totalRating = estimate.reduce(
            (sum, current) => sum + current.rating,
            0
        );
        return Math.floor(totalRating / estimate.length);
    }

    private calculateHours(
        milliseconds1: number,
        milliseconds2: number
    ): number {
        const milliseconds = milliseconds2 - milliseconds1;
        const hours = milliseconds / (1000 * 60 * 60);
        return parseFloat(hours.toFixed(1));
    }
}

export default CoworkingService;
