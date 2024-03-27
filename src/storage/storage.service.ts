import mime from 'mime-types';

export default abstract class StorageService {
  abstract upload(
    stream: any,
    filename: string,
    mimetype: string,
    filePath?: string,
    publicStorage?: boolean,
  ): Promise<string>;
  abstract delete(fileName: string, filePath?: string): Promise<any>; //FIXME: normalizar retorno, cada adapter retorna algo diferente
  abstract url(filename: string, filepath?: string): string; //FIXME: melhorar o código
  protected extension(mimetype: string): string | false {
    return mime.extension(mimetype);
  }

  abstract moveFile(
    sourceFileName: string,
    destFileName: string,
    publicStorageInDest: boolean,
    sourcePath?: string,
    destPath?: string,
  );

  abstract copyFile(
    sourceFileName: string,
    destFileName: string,
    sourceBucket: string,
    includeBaseDirectoryInSrcPath: boolean,
    publicStorageInDest: boolean,
    sourcePath?: string,
    destPath?: string,
  );

  abstract getFileContents(fileName: string, filePath: string): Promise<string>;

  abstract fileExists(
    filename: string,
    filePath: string,
  ): Promise<boolean> | boolean;

  abstract setStorageHmlParams();
}
