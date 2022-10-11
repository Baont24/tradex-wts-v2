import {
  ACCOUNT_ASSET_INFORMATION,
  ACCOUNT_ASSET_INFORMATION_FAILED,
  ACCOUNT_ASSET_INFORMATION_SUCCESS,
} from 'redux/actions';
import { IAssetInformationResponse } from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const AssetInformation: IQueryReducer<Partial<IAssetInformationResponse | null>> = (
  state = { data: null, status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_ASSET_INFORMATION:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_ASSET_INFORMATION_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_ASSET_INFORMATION_FAILED:
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
