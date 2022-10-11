import { GLOBAL_RESET_MARKET_DATA } from 'redux/actions';
import { IAction } from 'interfaces/common';

export function ResetMarketDataTrigger(
  state = false,
  action: IAction<boolean>
) {
  switch (action.type) {
    case GLOBAL_RESET_MARKET_DATA:
      return !state;
    default:
      return state;
  }
}
