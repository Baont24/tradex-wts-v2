import { GLOBAL_RESET_BOARD_DATA } from 'redux/actions';
import { IAction } from 'interfaces/common';

export const resetBoardData = (): IAction<boolean> => ({
  type: GLOBAL_RESET_BOARD_DATA,
  payload: true,
});
