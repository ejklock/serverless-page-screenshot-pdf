import { Body, Controller, Get, NotFoundException, Param, Post, Res } from '@nestjs/common';
import { basename, join } from 'path';
import { Response } from 'express';
import { StoreOrGetPdfDto } from './dtos/storeOrGetPdf.dto';
import { StorePDFUrls } from './dtos/StorePDFUrls';
import { ProductPdfService } from './product-pdf/product-pdf.service';

@Controller()
export class AppController {
  constructor(private productPdfService: ProductPdfService) {}

  @Get('test')
  async test(@Res() res: Response) {
    // res.set('Content-Type', 'application/pdf');
    res.send(
      this.productPdfService.generatePDFFromURL('https://www.google.com.br'),
    );
  }

  @Post('getProductPDF')
  async getProductPDF(@Body() data: StoreOrGetPdfDto, @Res() res: Response) {
    try {
      return res.json({
        url: await this.productPdfService.storeOrGetPdfFile(
          data.url,
          data.override,
        ),
      });
    } catch (error) {
      return res.status(500).json({
        error: error?.message,
      });
    }
  }

  @Post('storePdfByUrls')
  async storePdfByUrls(@Body() data: StorePDFUrls, @Res() res: Response) {
    try {
      this.productPdfService.storePDFUrls(data.urls);

      return res.json({ message: 'Started' });
    } catch (error) {
      return res.status(500).json({
        error: error?.message,
      });
    }
  }

  @Get('testLambda')
  async testLambda() {
    return 'testLambda 7';
  }



  @Get('*')
  getFile(@Param('0') filepath: string, @Res() res: Response) {
    try {
      const isInsideUploadFolder = filepath.startsWith('upload/');
    if (!isInsideUploadFolder) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const filename = basename(filepath);
    const fullPath = join(__dirname, '..', filepath);
    res.sendFile(fullPath);
    } catch (error) {
      throw new NotFoundException('Arquivo não encontrado');
    }
    
  }
}
