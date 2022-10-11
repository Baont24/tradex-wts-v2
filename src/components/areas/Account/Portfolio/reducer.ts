import {
  ACCOUNT_OPEN_POSITION_ITEM,
  ACCOUNT_OPEN_POSITION_ITEM_FAILED,
  ACCOUNT_OPEN_POSITION_ITEM_SUCCESS,
} from 'redux/actions';
import { IDrAccountOpenPositionItem } from 'interfaces/api';
import { IQueryReducer } from 'interfaces/common';

export const AccountOpenPositionItem: IQueryReducer<IDrAccountOpenPositionItem | null> = (
  state = { data: null, status: {} },
  action
) => {
  switch (action.type) {
    case ACCOUNT_OPEN_POSITION_ITEM:
      return {
        data: state.data,
        status: {
          isLoading: true,
        },
      };
    case ACCOUNT_OPEN_POSITION_ITEM_SUCCESS:
      return {
        data: action.payload,
        status: {
          isSucceeded: true,
        },
      };
    case ACCOUNT_OPEN_POSITION_ITEM_FAILED:
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
