"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
let SessionService = class SessionService {
    secret = process.env.JWT_SECRET || "sqj-local-development-only";
    issue(subject, role, ttlSeconds = 8 * 60 * 60) {
        const issuedAt = Math.floor(Date.now() / 1000);
        const payload = { subject, role, issuedAt, expiresAt: issuedAt + ttlSeconds };
        const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
        const signature = this.sign(body);
        return { accessToken: `${body}.${signature}`, expiresAt: payload.expiresAt, role };
    }
    verify(token, expectedRole) {
        const [body, signature] = token.split(".");
        if (!body || !signature)
            throw new common_1.UnauthorizedException("登录状态无效");
        const expected = Buffer.from(this.sign(body));
        const actual = Buffer.from(signature);
        if (expected.length !== actual.length || !(0, node_crypto_1.timingSafeEqual)(expected, actual)) {
            throw new common_1.UnauthorizedException("登录状态无效");
        }
        const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
        if (payload.expiresAt <= Math.floor(Date.now() / 1000))
            throw new common_1.UnauthorizedException("登录状态已过期");
        if (expectedRole && payload.role !== expectedRole)
            throw new common_1.UnauthorizedException("账号权限不匹配");
        return payload;
    }
    sign(body) {
        return (0, node_crypto_1.createHmac)("sha256", this.secret).update(body).digest("base64url");
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)()
], SessionService);
