import AppEnvVarConfigValidate from '../config/app-envvar-config-validate';
import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

const envValidator = new AppEnvVarConfigValidate(
  [
    'APP_CONFIG_TEST_MODE_ENABLED',
    'APP_CONFIG_TEST_MODE_DEFAULT_NOTIFICATION_CODE',
    'APP_CONFIG_TEST_MODE_DEFAULT_SMS_TO_PHONE_NUMBER',
  ],
  { envVarKey: 'APP_CONFIG_TEST_MODE_ENABLED', envVarBooleanValue: true },
);

export default registerAs('app-config', () => {
  envValidator.validate();
  return {
    logLevels: (process.env.LOG_LEVELS || 'error,warn').split(
      ',',
    ) as LogLevel[],
  };
});
