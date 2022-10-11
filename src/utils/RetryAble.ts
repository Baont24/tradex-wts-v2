import { TMutable } from 'interfaces/common';
import { delay } from './delay';

export interface IErrorHandlerResult<T> {
  readonly result?: T;
  readonly error?: Error;
}

export default class RetryAble<T> {
  private retryIndex: TMutable<number> = 0;
  private maxRetry = 5;
  constructor(
    private readonly runner: () => Promise<T>,
    private readonly errorHandler?: (
      error: any,
      index: number,
      final: boolean
    ) => IErrorHandlerResult<T>
  ) {}

  defaultErrorHandler: (
    error: any,
    index: number,
    final: boolean
  ) => IErrorHandlerResult<T> = (error: any, index: number, final: boolean) => {
    if (
      final ||
      !(error.code === 'INTERNAL_SERVER_ERROR' || error.name !== 'TimeoutError')
    ) {
      return {
        error,
      };
    }
    return {};
  };

  run: () => Promise<T> = async () => {
    try {
      const result: T = await this.runner();
      return result;
    } catch (error) {
      const isFinal = this.retryIndex >= this.maxRetry;
      const handlerResult: IErrorHandlerResult<T> = (
        this.errorHandler || this.defaultErrorHandler
      )(error, this.retryIndex, isFinal);
      if (handlerResult.error == null && handlerResult.result == null) {
        this.retryIndex++; // eslint-disable-line
        return delay<T>(this.run, 300 * this.retryIndex);
      } else if (handlerResult.result == null) {
        throw handlerResult.error || error;
      } else {
        return handlerResult.result;
      }
    }
  };
}
