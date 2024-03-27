import AppEnvVarConfigValidate from '../config/app-envvar-config-validate';
import { registerAs } from '@nestjs/config';

const envValidator = new AppEnvVarConfigValidate(
  [
    'APP_CONFIG_TEST_MODE_ENABLED',
    'APP_CONFIG_TEST_MODE_DEFAULT_NOTIFICATION_CODE',
    'APP_CONFIG_TEST_MODE_DEFAULT_SMS_TO_PHONE_NUMBER',
  ],
  { envVarKey: 'APP_CONFIG_TEST_MODE_ENABLED', envVarBooleanValue: true },
);

export default registerAs('storage-config', () => {
  envValidator.validate();
  return {
    engine: process.env.STORAGE_DEFAULT as 'local' | 's3',
    localDir: process.env.STORAGE_LOCAL_DIRECTORY,
    localUrl: process.env.STORAGE_LOCAL_URL,
  };
});
