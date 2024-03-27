import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

import { StoreOrGetPdfDto } from './storeOrGetPdf.dto';

export class StorePDFUrls {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreOrGetPdfDto)
  urls: StoreOrGetPdfDto[];
}
