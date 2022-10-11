import {
  AUTHENTICATION_LOGOUT,
  GLOBAL_FOOTER_FUNCTION,
  GLOBAL_SIDEBAR_FUNCTION,
} from 'redux/actions';
import { FunctionKey } from 'constants/enum';
import { IOrderForm } from 'components/common/OrderForm/config';
import { IReducer } from 'interfaces/common';
import { ISideBarFunctionAction } from './actions';

export const SideBarFunction: IReducer<
  {
    readonly key?: FunctionKey;
    readonly footerKey?: FunctionKey;
    readonly orderForm?: IOrderForm;
  },
  ISideBarFunctionAction
> = (state = {}, action) => {
  const key = (action.payload as ISideBarFunctionAction)?.key;
  switch (action.type) {
    case GLOBAL_SIDEBAR_FUNCTION:
      return {
        key,
        footerKey:
          state.footerKey === key ||
          (state.footerKey === FunctionKey.ORDER &&
            key === FunctionKey.QUICK_ORDER)
            ? undefined
            : state.footerKey,
        orderForm: (action.payload as ISideBarFunctionAction).orderForm,
      };
    case GLOBAL_FOOTER_FUNCTION:
      return {
        key:
          state.key === key ||
          (key === FunctionKey.ORDER && state.key === FunctionKey.QUICK_ORDER)
            ? undefined
            : state.key,
        footerKey: key as FunctionKey,
        orderForm: (action.payload as ISideBarFunctionAction).orderForm,
      };
    case AUTHENTICATION_LOGOUT:
      return {};
    default:
      return state;
  }
};
