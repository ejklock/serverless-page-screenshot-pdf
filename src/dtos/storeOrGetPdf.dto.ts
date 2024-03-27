import { IsUrl } from 'class-validator';

export class StoreOrGetPdfDto {
  @IsUrl()
  url: string;
  override: boolean;
}
