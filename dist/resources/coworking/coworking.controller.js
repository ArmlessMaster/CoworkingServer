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
const express_1 = require("express");
const http_exception_1 = __importDefault(require("@/utils/exceptions/http.exception"));
const coworking_service_1 = __importDefault(require("@/resources/coworking/coworking.service"));
const validation_middleware_1 = __importDefault(require("@/middleware/validation.middleware"));
const coworking_validation_1 = __importDefault(require("@/resources/coworking/coworking.validation"));
const authenticated_middleware_1 = require("@/middleware/authenticated.middleware");
const multer_1 = __importDefault(require("@/utils/multer/multer"));
class CoworkingController {
    constructor() {
        this.path = '/coworking';
        this.router = (0, express_1.Router)();
        this.coworkingService = new coworking_service_1.default();
        this.getAvailableAppointmentTimes = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id, date, seatsNumber } = req.properties;
                const availableAppointmentTimes = yield this.coworkingService.getAvailableAppointmentTimes(_id, date, seatsNumber);
                res.status(200).json({ data: availableAppointmentTimes });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const { name, region, city, address, phoneNumber, email, description, price, maxSeats, service, workSchedule, } = req.properties;
                const coworking = yield this.coworkingService.create(userId, name, region, city, address, phoneNumber, email, description, price, maxSeats, service, workSchedule);
                res.status(201).json({ data: coworking });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const { _id, name, region, city, address, phoneNumber, email, description, price, maxSeats, service, workSchedule, } = req.properties;
                const coworking = yield this.coworkingService.update(_id, userId, name, region, city, address, phoneNumber, email, description, price, maxSeats, service, workSchedule);
                res.status(201).json({ data: coworking });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.getOneById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const coworking = yield this.coworkingService.getOneById(req.params._id);
                res.status(200).json({ data: coworking });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.search = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const searchOptions = req.properties;
                const coworkings = yield this.coworkingService.search(searchOptions);
                res.status(200).json({ data: coworkings });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.adminSearch = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const searchOptions = req.properties;
                const coworkings = yield this.coworkingService.adminSearch(userId, searchOptions);
                res.status(200).json({ data: coworkings });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.remove = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const { _id } = req.properties;
                const coworking = yield this.coworkingService.remove(_id, userId);
                res.status(201).json({ data: coworking });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.getMinMaxCoworkingPrice = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const prices = yield this.coworkingService.getMinMaxCoworkingPrice();
                res.status(201).json({ data: prices });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.getMinMaxCoworkingPriceAdmin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const prices = yield this.coworkingService.getMinMaxCoworkingPriceAdmin(userId);
                res.status(201).json({ data: prices });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.uploadImage = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id, file } = req.properties;
                const userId = req.user._id;
                yield this.coworkingService.uploadImage(_id, file, userId);
                res.status(204).send();
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.deleteImage = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id, path } = req.properties;
                const userId = req.user._id;
                yield this.coworkingService.deleteImage(_id, path, userId);
                res.status(204).send();
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.createEstimate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, rating, review, _id } = req.properties;
                yield this.coworkingService.createEstimate(userId, rating, review, _id);
                res.status(204).send();
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.deleteEstimate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id, estimateId, userId } = req.properties;
                yield this.coworkingService.deleteEstimate(_id, estimateId, userId);
                res.status(204).send();
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.createSurvey = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id, userId, name, email, phoneNumber, date, startTime, endTime, numberSeats, } = req.properties;
                const survey = yield this.coworkingService.createSurvey(_id, userId, name, email, phoneNumber, date, startTime, endTime, numberSeats);
                res.status(201).json({ data: survey });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.confirmSurvey = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const { _id, status } = req.properties;
                const survey = yield this.coworkingService.confirmSurvey(userId, _id, status);
                res.status(201).json({ data: survey });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.removeSurvey = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const { _id } = req.properties;
                const survey = yield this.coworkingService.removeSurvey(userId, _id);
                res.status(201).json({ data: survey });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.getOneSurveyById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const survey = yield this.coworkingService.getOneSurveyById(userId, req.params._id);
                res.status(200).json({ data: survey });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.searchSurvey = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return next(new http_exception_1.default(401, 'Unauthorized'));
                }
                const userId = req.user._id;
                const searchOptions = req.properties;
                const surveys = yield this.coworkingService.searchSurvey(userId, searchOptions);
                res.status(200).json({ data: surveys });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.initialiseRoutes();
    }
    initialiseRoutes() {
        this.router.get(`${this.path}/available-appointment-times`, (0, validation_middleware_1.default)(coworking_validation_1.default.getAvailableAppointmentTimes), this.getAvailableAppointmentTimes);
        this.router.post(`${this.path}`, (0, validation_middleware_1.default)(coworking_validation_1.default.create), authenticated_middleware_1.authenticatedMiddleware, this.create);
        this.router.put(`${this.path}`, (0, validation_middleware_1.default)(coworking_validation_1.default.update), authenticated_middleware_1.authenticatedMiddleware, this.update);
        this.router.get(`${this.path}/get-one/:_id`, this.getOneById);
        this.router.get(`${this.path}`, (0, validation_middleware_1.default)(coworking_validation_1.default.search), this.search);
        this.router.get(`${this.path}/admin-search`, (0, validation_middleware_1.default)(coworking_validation_1.default.search), authenticated_middleware_1.authenticatedMiddleware, this.adminSearch);
        this.router.delete(`${this.path}`, (0, validation_middleware_1.default)(coworking_validation_1.default.remove), authenticated_middleware_1.authenticatedMiddleware, this.remove);
        this.router.get(`${this.path}/price`, this.getMinMaxCoworkingPrice);
        this.router.get(`${this.path}/admin-price`, authenticated_middleware_1.authenticatedMiddleware, this.getMinMaxCoworkingPriceAdmin);
        this.router.post(`${this.path}/image`, multer_1.default.single('file'), (0, validation_middleware_1.default)(coworking_validation_1.default.uploadImage), authenticated_middleware_1.authenticatedMiddleware, this.uploadImage);
        this.router.delete(`${this.path}/image`, (0, validation_middleware_1.default)(coworking_validation_1.default.deleteImage), authenticated_middleware_1.authenticatedMiddleware, this.deleteImage);
        this.router.post(`${this.path}/estimate`, (0, validation_middleware_1.default)(coworking_validation_1.default.createEstimate), this.createEstimate);
        this.router.delete(`${this.path}/estimate`, (0, validation_middleware_1.default)(coworking_validation_1.default.deleteEstimate), this.deleteEstimate);
        this.router.post(`${this.path}/survey`, (0, validation_middleware_1.default)(coworking_validation_1.default.createSurvey), this.createSurvey);
        this.router.put(`${this.path}/survey-confirm`, (0, validation_middleware_1.default)(coworking_validation_1.default.confirmSurvey), authenticated_middleware_1.authenticatedMiddleware, this.confirmSurvey);
        this.router.put(`${this.path}/survey-remove`, (0, validation_middleware_1.default)(coworking_validation_1.default.removeSurvey), authenticated_middleware_1.authenticatedMiddleware, this.removeSurvey);
        this.router.get(`${this.path}/survey/get-one/:_id`, authenticated_middleware_1.authenticatedMiddleware, this.getOneSurveyById);
        this.router.get(`${this.path}/survey-search`, (0, validation_middleware_1.default)(coworking_validation_1.default.searchSurvey), authenticated_middleware_1.authenticatedMiddleware, this.searchSurvey);
    }
}
exports.default = CoworkingController;
