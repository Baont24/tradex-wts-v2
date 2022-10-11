import {
  ACCOUNT_ASSET_INFORMATION_DERIVATIVES,
  ACCOUNT_ASSET_INFORMATION_DERIVATIVES_FAILED,
  ACCOUNT_ASSET_INFORMATION_DERIVATIVES_SUCCESS,
} from './actions';
import { IEquityAssetInformationResponse } from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const AssetInforDerivatives: IQueryReducer<IEquityAssetInformationResponse | null> = (
  state = { data: null, status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_ASSET_INFORMATION_DERIVATIVES:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_ASSET_INFORMATION_DERIVATIVES_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_ASSET_INFORMATION_DERIVATIVES_FAILED:
      return {
        data: null,
        status: {
          isFailed: true,
        },
      };
    default:
      return state;
  }
};
