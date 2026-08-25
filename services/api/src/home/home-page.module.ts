import { Module } from "@nestjs/common";
import { HomePageController } from "./home-page.controller";
import { HomePageService } from "./home-page.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [HomePageController],
  providers: [HomePageService],
  exports: [HomePageService]
})
export class HomePageModule {}
