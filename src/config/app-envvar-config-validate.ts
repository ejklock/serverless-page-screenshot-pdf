import { toBoolean } from '../util/app.utils';

type ValidateOnlyWhenConditions = {
  envVarKey: string;
  envVarBooleanValue: boolean;
};

export default class AppEnvVarConfigValidate {
  private errorMessage = 'Variavel(eis) de Ambiente não definida(s): ';
  private hasUndefinedEnvVar = false;
  private _envs = [];
  private validateWhenCondition: ValidateOnlyWhenConditions;
  private exceptionKeyValue: boolean;

  /**
   *
   * @param envs - A lista das variaveis de ambiente a serem validadas
   * @param validateOnlyWhenCondition - A condição de se e quando a validação deve ocorrer
   */
  constructor(
    envs: string[],
    validateOnlyWhenCondition?: ValidateOnlyWhenConditions,
  ) {
    this._envs = envs;
    this.validateWhenCondition = validateOnlyWhenCondition;
  }

  private needsValidate() {
    if (this.exceptionKeyValue !== undefined) {
      return (
        this.exceptionKeyValue === this.validateWhenCondition.envVarBooleanValue
      );
    }
    return true;
  }

  private checkForValidationConditions() {
    if (this.validateWhenCondition) {
      const { [this.validateWhenCondition.envVarKey]: exceptionKeyValue } =
        process.env;
      this.exceptionKeyValue = toBoolean(exceptionKeyValue);
    }
  }

  public validate() {
    this._envs.forEach((envVarKey) => {
      const { [envVarKey]: envVarValue } = process.env;

      this.checkForValidationConditions();

      if (envVarValue === undefined && this.needsValidate()) {
        this.hasUndefinedEnvVar = true;

        if (this.hasUndefinedEnvVar) {
          this.errorMessage += `${envVarKey},`;
        }
      }
    });

    if (this.hasUndefinedEnvVar) {
      throw new Error(this.errorMessage);
    }
  }
}
