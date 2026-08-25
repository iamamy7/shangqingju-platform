import { Body, Controller, ForbiddenException, Post } from "@nestjs/common";
import { randomInt } from "node:crypto";
import { SessionService } from "./session.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly sessions: SessionService) {}

  @Post("otp/request")
  requestOtp(@Body() body: { phone?: string }) {
    if (!body.phone?.match(/^1\d{10}$/)) throw new ForbiddenException("请输入正确的手机号");
    return {
      requestId: `OTP-${Date.now()}`,
      expiresIn: 300,
      mockCode: process.env.NODE_ENV === "production" ? undefined : "123456"
    };
  }

  @Post("login/phone")
  loginPhone(@Body() body: { phone?: string; code?: string }) {
    if (!body.phone?.match(/^1\d{10}$/) || body.code !== "123456") {
      throw new ForbiddenException("手机号或验证码不正确");
    }
    return {
      user: { id: `U-${body.phone.slice(-4)}`, phone: body.phone, displayName: `用户${body.phone.slice(-4)}` },
      session: this.sessions.issue(body.phone, "USER")
    };
  }

  @Post("admin/login")
  loginAdmin(@Body() body: { username?: string; password?: string }) {
    if (body.username !== "operator" || body.password !== "123456") {
      throw new ForbiddenException("运营账号或密码不正确");
    }
    return {
      operator: { id: "OP-001", name: "运营管理员" },
      session: this.sessions.issue("OP-001", "ADMIN", 4 * 60 * 60)
    };
  }
}

