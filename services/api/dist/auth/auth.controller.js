"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const session_service_1 = require("./session.service");
let AuthController = class AuthController {
    sessions;
    constructor(sessions) {
        this.sessions = sessions;
    }
    requestOtp(body) {
        if (!body.phone?.match(/^1\d{10}$/))
            throw new common_1.ForbiddenException("请输入正确的手机号");
        return {
            requestId: `OTP-${Date.now()}`,
            expiresIn: 300,
            mockCode: process.env.NODE_ENV === "production" ? undefined : "123456"
        };
    }
    loginPhone(body) {
        if (!body.phone?.match(/^1\d{10}$/) || body.code !== "123456") {
            throw new common_1.ForbiddenException("手机号或验证码不正确");
        }
        return {
            user: { id: `U-${body.phone.slice(-4)}`, phone: body.phone, displayName: `用户${body.phone.slice(-4)}` },
            session: this.sessions.issue(body.phone, "USER")
        };
    }
    loginAdmin(body) {
        if (body.username !== "operator" || body.password !== "123456") {
            throw new common_1.ForbiddenException("运营账号或密码不正确");
        }
        return {
            operator: { id: "OP-001", name: "运营管理员" },
            session: this.sessions.issue("OP-001", "ADMIN", 4 * 60 * 60)
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("otp/request"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "requestOtp", null);
__decorate([
    (0, common_1.Post)("login/phone"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginPhone", null);
__decorate([
    (0, common_1.Post)("admin/login"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginAdmin", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], AuthController);
