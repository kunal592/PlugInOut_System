import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class CoreConfigModule { }
