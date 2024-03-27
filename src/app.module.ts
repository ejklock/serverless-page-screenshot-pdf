import appConfig from './config/app.config';
import awsConfig from './config/aws.config';
import storageConfig from './config/storage.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ProductPdfModule } from './product-pdf/product-pdf.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, storageConfig, awsConfig],
    }),
    StorageModule,
    ProductPdfModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
