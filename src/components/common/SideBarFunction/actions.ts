import { FunctionKey } from 'constants/enum';
import { GLOBAL_FOOTER_FUNCTION, GLOBAL_SIDEBAR_FUNCTION } from 'redux/actions';
import { IAction } from 'interfaces/common';
import { IOrderForm } from 'components/common/OrderForm/config';

export interface ISideBarFunctionAction {
  readonly key?: FunctionKey;
  readonly orderForm?: IOrderForm;
}

export const changeSidebarFunction = (
  payload: ISideBarFunctionAction
): IAction<ISideBarFunctionAction> => ({
  type: GLOBAL_SIDEBAR_FUNCTION,
  payload,
});

export const changeFooterFunction = (
  payload: ISideBarFunctionAction
): IAction<ISideBarFunctionAction> => ({
  type: GLOBAL_FOOTER_FUNCTION,
  payload,
});
