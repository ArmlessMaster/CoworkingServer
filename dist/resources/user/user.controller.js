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
const user_service_1 = __importDefault(require("@/resources/user/user.service"));
const validation_middleware_1 = __importDefault(require("@/middleware/validation.middleware"));
const user_validation_1 = __importDefault(require("@/resources/user/user.validation"));
const admin_middleware_1 = require("@/middleware/admin.middleware");
const http_exception_1 = __importDefault(require("@/utils/exceptions/http.exception"));
const authenticated_middleware_1 = require("@/middleware/authenticated.middleware");
class UserController {
    constructor() {
        this.path = '/user';
        this.router = (0, express_1.Router)();
        this.UserService = new user_service_1.default();
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.properties;
                yield this.UserService.create(email, password);
                res.status(204).send();
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.properties;
                const accessToken = yield this.UserService.login(email, password);
                res.status(200).json({ data: accessToken });
            }
            catch (error) {
                next(new http_exception_1.default(400, error.message));
            }
        });
        this.getMe = (req, res, next) => {
            if (!req.user) {
                return next(new http_exception_1.default(404, 'No logged in'));
            }
            res.status(200).send({ data: req.user });
        };
        this.initialiseRoutes();
    }
    initialiseRoutes() {
        this.router.post(`${this.path}`, (0, validation_middleware_1.default)(user_validation_1.default.create), admin_middleware_1.adminMiddleware, this.create);
        this.router.post(`${this.path}/login`, (0, validation_middleware_1.default)(user_validation_1.default.login), this.login);
        this.router.get(`${this.path}`, authenticated_middleware_1.authenticatedMiddleware, this.getMe);
    }
}
exports.default = UserController;
