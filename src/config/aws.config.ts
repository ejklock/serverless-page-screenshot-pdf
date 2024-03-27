import { registerAs } from '@nestjs/config';
import AppEnvVarConfigValidate from './app-envvar-config-validate';

const envValidator = new AppEnvVarConfigValidate([
  'APP_AWS_ACCESS_KEY_ID',
  'APP_AWS_SECRET_ACCESS_KEY',
  'APP_AWS_DEFAULT_REGION',
  'AWS_BUCKET',
  'AWS_URL',
  'AWS_DIRECTORY',
]);
export default registerAs(
  'aws',
  () => (
    envValidator.validate(),
    {
      accessKey: process.env.APP_AWS_ACCESS_KEY_ID,
      secret: process.env.APP_AWS_SECRET_ACCESS_KEY,
      region: process.env.APP_AWS_DEFAULT_REGION,
      hmlRegion: process.env.APP_AWS_HML_DEFAULT_REGION,
      bucket: process.env.AWS_BUCKET,
      hmlBucket: process.env.AWS_HML_BUCKET,
      url: process.env.AWS_URL,
      hmlUrl: process.env.AWS_HML_URL,
      directory: process.env.AWS_DIRECTORY,
    }
  ),
);
