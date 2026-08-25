import { Module } from "@nestjs/common";
import { MockEnterpriseProvider } from "./mock-enterprise.provider";
import { ENTERPRISE_DATA_PROVIDER } from "./provider.tokens";

@Module({
  providers: [
    MockEnterpriseProvider,
    {
      provide: ENTERPRISE_DATA_PROVIDER,
      useExisting: MockEnterpriseProvider
    }
  ],
  exports: [ENTERPRISE_DATA_PROVIDER]
})
export class ProviderModule {}

