import {
  ACCOUNT_OPEN_POSITION_ITEM,
  ACCOUNT_OPEN_POSITION_ITEM_FAILED,
  ACCOUNT_OPEN_POSITION_ITEM_SUCCESS,
} from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IEquityIDrAccountOpenPositionItemParams } from 'interfaces/api';

export const getAccountOpenPositionItem = (
  payload: IEquityIDrAccountOpenPositionItemParams
): IAction<IEquityIDrAccountOpenPositionItemParams> => ({
  type: ACCOUNT_OPEN_POSITION_ITEM,
  response: {
    success: ACCOUNT_OPEN_POSITION_ITEM_SUCCESS,
    failed: ACCOUNT_OPEN_POSITION_ITEM_FAILED,
  },
  payload,
});
