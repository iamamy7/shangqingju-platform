import { Injectable, UnauthorizedException } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionRole = "USER" | "ADMIN";

export interface SessionPayload {
  subject: string;
  role: SessionRole;
  issuedAt: number;
  expiresAt: number;
}

@Injectable()
export class SessionService {
  private readonly secret = process.env.JWT_SECRET || "sqj-local-development-only";

  issue(subject: string, role: SessionRole, ttlSeconds = 8 * 60 * 60) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: SessionPayload = { subject, role, issuedAt, expiresAt: issuedAt + ttlSeconds };
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = this.sign(body);
    return { accessToken: `${body}.${signature}`, expiresAt: payload.expiresAt, role };
  }

  verify(token: string, expectedRole?: SessionRole): SessionPayload {
    const [body, signature] = token.split(".");
    if (!body || !signature) throw new UnauthorizedException("登录状态无效");
    const expected = Buffer.from(this.sign(body));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new UnauthorizedException("登录状态无效");
    }
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (payload.expiresAt <= Math.floor(Date.now() / 1000)) throw new UnauthorizedException("登录状态已过期");
    if (expectedRole && payload.role !== expectedRole) throw new UnauthorizedException("账号权限不匹配");
    return payload;
  }

  private sign(body: string) {
    return createHmac("sha256", this.secret).update(body).digest("base64url");
  }
}

