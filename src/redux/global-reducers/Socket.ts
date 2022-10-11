import {
  GLOBAL_PRICE_BOARD_SOCKET,
  GLOBAL_WTS_SOCKET,
  SOCKET_STATUS_CHANGE,
  SOCKET_WTS_STATUS_CHANGE,
} from 'redux/actions';
import { IAction, ISocket } from 'interfaces/common';
import { SocketStatus as SocketStatusEnum } from 'constants/enum';

export function PriceBoardSocket(
  state: ISocket | null = null,
  action: IAction<ISocket>
) {
  switch (action.type) {
    case GLOBAL_PRICE_BOARD_SOCKET:
      return action.payload;
    default:
      return state;
  }
}

export function WtsSocket(
  state: ISocket | null = null,
  action: IAction<ISocket>
) {
  switch (action.type) {
    case GLOBAL_WTS_SOCKET:
      return action.payload;
    default:
      return state;
  }
}

export function SocketStatus(
  state: SocketStatusEnum = SocketStatusEnum.DISCONNECTED,
  action: IAction<SocketStatusEnum>
) {
  switch (action.type) {
    case SOCKET_STATUS_CHANGE:
      return action.payload;
    default:
      return state;
  }
}

export function WTSSocketStatus(
  state: SocketStatusEnum = SocketStatusEnum.DISCONNECTED,
  action: IAction<SocketStatusEnum>
) {
  switch (action.type) {
    case SOCKET_WTS_STATUS_CHANGE:
      return action.payload;
    default:
      return state;
  }
}
