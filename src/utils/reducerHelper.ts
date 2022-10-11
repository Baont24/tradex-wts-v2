import { IQueryState, IQueryStatus } from '../interfaces/common';

export function updateStartQueryState<T>(): IQueryState<T> {
  return {
    status: {
      isLoading: true,
    },
  };
}

export function updateSuccessQueryState<T>(data: T): IQueryState<T> {
  return {
    data,
    status: {
      isSucceeded: true,
    },
  };
}

export function updateFailQueryState<T>(
  payload: Partial<IQueryStatus>
): IQueryState<T> {
  return {
    data: undefined,
    status: {
      isFailed: true,
      errorMessage: payload.errorMessage,
    },
  };
}
