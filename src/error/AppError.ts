interface IAppErroDTO {
  code?: number;
  message: string;
  documentation?: any;
  description?: string;
}

export default class AppError {
  public readonly code: number;

  public readonly description?: string;
  
  public readonly message: string;
  
  public readonly documentation?: any;
  
  constructor({
    code = 400,
    message,
    description,
    documentation
  }: IAppErroDTO) {
    Object.assign(this, {
      code,
      description,
      message,
      documentation
    });
  }
}