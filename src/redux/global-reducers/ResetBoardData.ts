import { GLOBAL_RESET_BOARD_DATA } from 'redux/actions';
import { IAction } from 'interfaces/common';

export function ResetBoardDataTrigger(state = false, action: IAction<boolean>) {
  switch (action.type) {
    case GLOBAL_RESET_BOARD_DATA:
      return !state;
    default:
      return state;
  }
}
