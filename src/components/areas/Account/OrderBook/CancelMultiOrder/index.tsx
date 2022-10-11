import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback, OtpModal } from 'components/common';
import { IEquityOrderBookResponse } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber, handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export enum SCREEN {
  ORDER_BOOK = 'orderBook',
  STOP_ORDER_HISTORY = 'stopOrderHistory',
}

interface ICancelMultiOrderModalProps
  extends React.ClassAttributes<CancelMultiOrderModalComponent>,
    WithNamespaces {
  readonly cancelOrderResult: IState['cancelOrderResult'];
  readonly data?: IEquityOrderBookResponse[];
  readonly show?: boolean;
  readonly screen?: SCREEN;
  readonly isStopOrderHistory?: boolean;

  readonly onHide?: () => void;
  readonly onSubmit?: () => void;
}

class CancelMultiOrderModalComponent extends React.Component<
  ICancelMultiOrderModalProps
> {
  constructor(props: ICancelMultiOrderModalProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, data } = this.props;

    return data ? (
      <OtpModal
        className={styles.CancelMultiOrderModal}
        show={this.props.show}
        onHide={this.props.onHide}
        onSubmit={this.props.onSubmit}
        horizontal={true}
        size="lg"
        isHorizontalOTP={true}
      >
        <div className={styles.Title}>
          {t('Multiple Order Cancel Confirmation')}
        </div>
        <div className={styles.OrderTable}>
          <table>
            <thead>
              <tr>
                <th>{t('Symbol')}</th>
                <th>{t('Buy/ Sell Order')}</th>
                <th>{t('Price')}</th>
                <th>{t('Quantity')}</th>
                {this.props.screen !== SCREEN.STOP_ORDER_HISTORY && (
                  <th>{t('Unmatched Quantity 1')}</th>
                )}
                <th>{t('Status')}</th>
                <th>{t('Time')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((val, i) => (
                <tr key={i}>
                  <td>{val.symbol}</td>
                  <td>{val.buySellOrder}</td>
                  <td>{formatNumber(val.orderPrice, 2)}</td>
                  <td>{formatNumber(val.orderQty, 2)}</td>
                  {this.props.screen !== SCREEN.STOP_ORDER_HISTORY && (
                    <td>{formatNumber(val.unmatchedQty, 2)}</td>
                  )}
                  <td>{val.orderStatus}</td>
                  <td>
                    {formatDateToDisplay(
                      val.orderTime,
                      'HH:mm:ss',
                      'yyyyMMddHHmmss',
                      this.props.isStopOrderHistory ? undefined : true
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OtpModal>
    ) : null;
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  symbolList: state.symbolList,
  orderStockInfo: state.orderStockInfo,
  cancelOrderResult: state.cancelOrderResult,
});

const mapDispatchToProps = {};

const CancelMultiOrderModal = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(CancelMultiOrderModalComponent)
  ),
  Fallback,
  handleError
);

export default CancelMultiOrderModal;
