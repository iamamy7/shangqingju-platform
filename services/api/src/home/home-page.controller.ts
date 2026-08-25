import { Body, Controller, Get, Headers, Put } from "@nestjs/common";
import { SessionService } from "../auth/session.service";
import { HomePageService } from "./home-page.service";

@Controller()
export class HomePageController {
  constructor(private readonly home: HomePageService, private readonly sessions: SessionService) {}

  @Get("home")
  publicPage() {
    return this.home.getPublicPage();
  }

  @Get("admin/homepage")
  adminPage(@Headers("authorization") auth = "") {
    this.admin(auth);
    return this.home.getAdminPage();
  }

  @Put("admin/homepage")
  update(@Headers("authorization") auth = "", @Body() content: Parameters<HomePageService["updatePage"]>[0]) {
    return this.home.updatePage(content, this.admin(auth));
  }

  private admin(auth: string) {
    return this.sessions.verify(auth.replace(/^Bearer\s+/i, ""), "ADMIN").subject;
  }
}
