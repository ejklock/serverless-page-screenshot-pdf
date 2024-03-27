import { Injectable, Logger } from '@nestjs/common';
import Chromium from '@sparticuz/chromium';
import * as crypto from 'crypto';
import Pupetter from 'puppeteer';
import { StoreOrGetPdfDto } from 'src/dtos/storeOrGetPdf.dto';
import StorageService from '../storage/storage.service';

@Injectable()
export class ProductPdfService {
  private readonly logger = new Logger(ProductPdfService.name);

  constructor(private storageService: StorageService) {}

  public async generatePDFFromURL(url: string): Promise<Buffer | boolean> {
    const browser = await Pupetter.launch({
      args: Chromium.args,
      defaultViewport: Chromium.defaultViewport,
      executablePath: await Chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });

    try {
      const page = await browser.newPage();

      await page.setRequestInterception(true);

      let response;
      do {
        response = await page.goto(`${url}?bypass=true`, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });

        if (response.status() === 202) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 5 segundos antes de tentar novamente
        }
      } while (response.status() === 202);

      await page.emulateMediaType('print');
      await page.waitForFunction(
        () => document.readyState === 'complete',
        { timeout: 6000 }, // Tempo limite de 6 segundos
      );

      await page.evaluate(() => {
        const cookiefirstElement = document.getElementById('cookiefirst-root');
        if (cookiefirstElement) {
          cookiefirstElement.remove();
        }
        window.print = () => {};
      });

      await page.addStyleTag({
        content: '@page {size:A4;  margin:0.4in; }',
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });

      return pdf;
    } catch (error) {
      this.logger.error(`${error}, url: ${url}`);
      throw error;
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }
  }

  public async storeOrGetPdfFile(url: string, override = false) {
    try {
      const hashFileName = crypto.createHash('sha1').update(url).digest('hex');

      const fileExists = await this.storageService.fileExists(
        `${hashFileName}.pdf`,
        'product-pdfs',
      );

      if (!fileExists || override) {
        const pdfGenerated = await this.generatePDFFromURL(url);

        if (pdfGenerated) {
          await this.storageService.upload(
            pdfGenerated,
            `${hashFileName}.pdf`,
            'application/pdf',
            'product-pdfs',
            true,
          );
        }
      }
      return this.storageService.url(`${hashFileName}.pdf`, 'product-pdfs');
    } catch (error) {
      this.logger.error(error);
      return '';
    }
  }

  public async storePDFUrls(urls: StoreOrGetPdfDto[]) {
    try {
      urls.forEach(async (url) => {
        this.logger.log(`url: ${url.url}`);
        this.storeOrGetPdfFile(url.url, url.override || false);
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
