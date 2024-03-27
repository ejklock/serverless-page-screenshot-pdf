import {
  CopyObjectCommandInput,
  HeadObjectCommandOutput,
  PutObjectCommandInput,
  S3,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import awsConfig from '../config/aws.config';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ReadStream } from 'fs';
import { normalizeUrl, trimChars } from '../util/app.utils';
import StorageService from './storage.service';

@Injectable()
export class S3StorageService extends StorageService {
  public setStorageHmlParams() {
    this._s3Bucket = this.config.hmlBucket;
    this.config.url = this.config.hmlUrl;
    this.config.region = this.config.hmlRegion;

    this._s3Client = new S3({
      region: this.config.hmlRegion,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secret,
      },
    });

    return this;
  }
  public async fileExists(
    filename: string,
    filePath: string,
  ): Promise<boolean> {
    try {
      let path = normalizeUrl(this._s3Directory);
      if (filePath) {
        path = normalizeUrl(path, filePath);
      }
      path = normalizeUrl(path, filename);
      const putRequest: PutObjectCommandInput = {
        Bucket: this._s3Bucket,
        Key: path,
      };
      await this._s3Client.headObject(putRequest);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      } else {
        throw new Error('Erro ao conectar ');
      }
    }
  }
  private readonly logger = new Logger(S3StorageService.name);

  protected _s3Client: S3;
  protected _s3Bucket: string;
  protected _s3Directory: string;

  constructor(
    @Inject(awsConfig.KEY) protected config: ConfigType<typeof awsConfig>,
    isHml = false,
  ) {
    super();
    this._s3Client = new S3({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secret,
      },
    });
    this._s3Bucket = config.bucket;
    this._s3Directory = config.directory;
    this.config.url = config.url;
  }

  public async upload(
    stream: ReadStream,
    filename: string,
    mimetype: string,
    filePath?: string,
    publicStorage = true,
  ): Promise<string> {
    let path = normalizeUrl(this._s3Directory);
    if (filePath) {
      path = normalizeUrl(path, filePath);
    }
    path = normalizeUrl(path, filename);

    const putRequest: PutObjectCommandInput = {
      Bucket: this._s3Bucket,
      Key: path,
      Body: stream,
      ContentType: mimetype,
      CacheControl: 'max-age=3600',
    };

    if (publicStorage) {
      putRequest.ACL = 'public-read';
    }

    const parallelUploads3 = new Upload({
      client: this._s3Client,
      params: putRequest,
    });
    await parallelUploads3.done();

    return filename;
  }

  public async delete(fileName: string, filePath?: string): Promise<any> {
    const path = this.normalizeFilePath(fileName, filePath);
    this.logger.verbose('Removing file', path);

    try {
      await this._s3Client.deleteObject({
        Bucket: this._s3Bucket,
        Key: path,
      });
    } catch {
      this.logger.warn('Cannot remove file from S3', path);
    }
  }

  public url(filename: string, filePath?: string): string {
    let path =
      trimChars(this.config.url, '/') +
      '/' +
      normalizeUrl(this._s3Directory) +
      '/';

    if (filePath) {
      path = normalizeUrl(path, filePath);
    }
    path = normalizeUrl(path, filename);
    return path;
  }

  public async moveFile(
    sourceFileName: string,
    destFileName: string,
    publicStorageInDest = true,
    sourcePath?: string,
    destPath?: string,
  ) {
    await this.copyFile(
      sourceFileName,
      destFileName,
      this._s3Bucket,
      true,
      publicStorageInDest,
      sourcePath,
      destPath,
    );
    await this.delete(sourceFileName, sourcePath);
  }

  public async copyFile(
    sourceFileName: string,
    destFileName: string,
    sourceBucket = this._s3Bucket,
    includeBaseDirectoryInSrcPath = true,
    publicStorageInDest = true,
    sourcePath?: string,
    destPath?: string,
  ) {
    let src = this.normalizeFilePath(
      sourceFileName,
      sourcePath,
      includeBaseDirectoryInSrcPath,
    );
    const dest = this.normalizeFilePath(destFileName, destPath);

    // quando o bucket de origem é diferente do destino o SDK não consegue verificar a existência do objeto
    if (!sourceBucket || sourceBucket == this._s3Bucket) {
      let exists: HeadObjectCommandOutput;
      try {
        exists = await this._s3Client.headObject({
          Bucket: sourceBucket,
          Key: src,
        });
      } catch (e) {
        console.log(e);
      }

      if (!exists) {
        console.log(`Objeto de origem não existe para mover. ${src}`);
        throw new Error(`Objeto de origem não existe para mover. ${src}`);
      }
    }

    // S3 cheat - source path must have bucket name
    src = normalizeUrl(sourceBucket, src);
    const command: CopyObjectCommandInput = {
      CopySource: src,
      Bucket: this._s3Bucket,
      Key: dest,
    };
    if (publicStorageInDest) {
      command.ACL = 'public-read';
    }

    await this._s3Client.copyObject(command);
  }

  public async getFileContents(
    fileName: string,
    filePath: string,
  ): Promise<string> {
    const src = this.normalizeFilePath(fileName, filePath);
    this.logger.verbose('Loading file contents', this._s3Bucket, src);
    try {
      const response = await this._s3Client.getObject({
        Bucket: this._s3Bucket,
        Key: src,
      });
      const responseString = await this.streamToString(response.Body);
      return responseString as string;
    } catch (error) {
      this.logger.verbose(
        'Error loading file contents',
        this._s3Bucket,
        src,
        error,
      );
    }

    return null;
  }

  private normalizeFilePath(
    fileName: string,
    filePath?: string,
    includeBaseDirectory = true,
  ) {
    let path = '';
    if (includeBaseDirectory) {
      path = normalizeUrl(this._s3Directory);
    }

    if (filePath) {
      path = normalizeUrl(path, filePath);
    }
    path = normalizeUrl(path, fileName);
    return path;
  }

  private streamToString = (stream) =>
    new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}
