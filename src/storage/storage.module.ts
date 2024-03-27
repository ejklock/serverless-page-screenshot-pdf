import awsConfig from '../config/aws.config';
import storageConfig from '../config/storage.config';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ProductPdfService } from '../product-pdf/product-pdf.service';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import StorageService from './storage.service';

const providers = [
  {
    provide: StorageService,
    inject: [awsConfig.KEY, storageConfig.KEY],
    useFactory: async (
      _awsConfig: ConfigType<typeof awsConfig>,
      _storageConfig: ConfigType<typeof storageConfig>,
    ) => {
      if (_storageConfig.engine === 'local') {
        return new LocalStorageService(_storageConfig);
      } else if (_storageConfig.engine === 's3') {
        return new S3StorageService(_awsConfig);
      }

      throw new Error(
        'Cannot identify storage engine. If storage is not used in this project, remove from AppModule.',
      );
    },
  },
  ProductPdfService,
];

@Module({
  providers: [...providers],
  exports: [...providers],
})
export class StorageModule {}
