import { Readable } from 'stream';

export function isDev(): boolean {
  return process.env.NODE_ENV != 'production';
}

export function isPromise(value: any): boolean {
  return value && value.then && typeof value.then === 'function';
}

export function toBoolean(value: string | number | boolean): boolean {
  return value == 'true' || value == 1 || value === true ? true : false;
}

/**
 * Remove primeira barra
 * Remove última barra
 * Remove double slash - não precedido por : (matém double slash de protocolo, ex: https://)
 */
export function normalizeUrl(...args: string[]) {
  return args
    .map((v) => trimChars(v, '/'))
    .join('/')
    .replace(/(?<!:)\/\//g, '/');
}

export function trimChars(value: string, char: string) {
  return value.replace(
    new RegExp('^[' + char + ']+|[' + char + ']+$', 'g'),
    '',
  );
}

export function obfuscatePhoneNumber(
  phoneNumberPrefix: string,
  phoneNumber: string,
) {
  return `${phoneNumberPrefix}${phoneNumber
    .substr(0, phoneNumber.length - 2)
    .replace(/[0-9]/g, '*')}${phoneNumber.substr(phoneNumber.length - 2)}`;
}

export function obfuscateEmail(email: string) {
  return email.replace(
    /(?<=.)[^@\n](?=[^@\n]*?@)|(?:(?<=@.)|(?!^)(?=[^@\n]*$)).(?=.*\.)/gm,
    '*',
  );
}

export function bufferToStream(binary) {
  return new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });
}

/**
 * await asyncIt(callback => funcao(foo, bar, callback))
 */
export function asyncIt<T>(
  call: (serviceCallback: (error: any, result: T) => void) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    try {
      call((error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function hexStringToByteArray(hexString) {
  if (hexString.length % 2 !== 0) {
    throw 'Must have an even number of hex digits to convert to bytes';
  } /* w w w.  jav  a2 s .  c o  m*/
  var numBytes = hexString.length / 2;
  var byteArray = new Uint8Array(numBytes);
  for (var i = 0; i < numBytes; i++) {
    byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return byteArray;
}
