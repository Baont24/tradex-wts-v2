import { IAction } from 'interfaces/common';
import { IAssetInformationDerivativesParams } from 'interfaces/api';

export const ACCOUNT_ASSET_INFORMATION_DERIVATIVES =
  'account/ASSET_INFORMATION_DERIVATIVES';
export const ACCOUNT_ASSET_INFORMATION_DERIVATIVES_SUCCESS =
  'account/ASSET_INFORMATION_DERIVATIVES_SUCCESS';
export const ACCOUNT_ASSET_INFORMATION_DERIVATIVES_FAILED =
  'account/ASSET_INFORMATION_DERIVATIVES_FAILED';

export const getAssetInforDerivatives = (
  payload: IAssetInformationDerivativesParams
): IAction<IAssetInformationDerivativesParams> => ({
  type: ACCOUNT_ASSET_INFORMATION_DERIVATIVES,
  response: {
    success: ACCOUNT_ASSET_INFORMATION_DERIVATIVES_SUCCESS,
    failed: ACCOUNT_ASSET_INFORMATION_DERIVATIVES_FAILED,
  },
  payload,
});
