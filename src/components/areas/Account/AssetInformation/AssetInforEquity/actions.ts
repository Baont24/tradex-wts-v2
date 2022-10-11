import {
  ACCOUNT_ASSET_INFORMATION,
  ACCOUNT_ASSET_INFORMATION_FAILED,
  ACCOUNT_ASSET_INFORMATION_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IAssetInformationParams } from 'interfaces/api';

export const getAssetInformation = (
  payload: IAssetInformationParams
): IAction<IAssetInformationParams> => ({
  type: ACCOUNT_ASSET_INFORMATION,
  response: {
    success: ACCOUNT_ASSET_INFORMATION_SUCCESS,
    failed: ACCOUNT_ASSET_INFORMATION_FAILED,
  },
  payload,
});
