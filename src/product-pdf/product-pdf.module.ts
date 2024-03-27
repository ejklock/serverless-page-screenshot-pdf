import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ProductPdfService } from './product-pdf.service';

@Module({
  imports: [StorageModule],
  providers: [ProductPdfService],
  exports: [ProductPdfService],
})
export class ProductPdfModule {}
