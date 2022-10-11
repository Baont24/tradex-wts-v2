import * as React from 'react';
import * as classNames from 'classnames';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { FaTimes } from 'react-icons/fa';
import { Fallback, SheetData } from 'components/common';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { Modal } from 'react-bootstrap';
import { SellBuyType, SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber, handleError } from 'utils/common';
import { queryOrderBookDetail } from '../actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IOrderInfoProps
  extends React.ClassAttributes<OrderInfoComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly data?: IOrderBookReducer;
  readonly show?: boolean;
  readonly orderBookDetail: IState['orderBookDetail'];

  readonly onHide?: () => void;
  readonly queryOrderBookDetail: typeof queryOrderBookDetail;
}

class OrderInfoComponent extends React.Component<IOrderInfoProps> {
  constructor(props: IOrderInfoProps) {
    super(props);

    this.state = {};
  }

  shouldComponentUpdate(nextProps: IOrderInfoProps) {
    if (
      nextProps.show &&
      nextProps.data !== this.props.data &&
      nextProps.data != null &&
      nextProps.selectedAccount != null
    ) {
      this.props.queryOrderBookDetail({
        accountNumber: nextProps.data.accountNumber,
        orderGroupNo:
          nextProps.data.orderGroupNo || nextProps.data.orderGroupID,
        orderNumber: nextProps.data.orderNumber,
        type: nextProps.selectedAccount.type,
      });
    }
    return true;
  }

  render() {
    const { t, data } = this.props;
    return (
      <Modal
        className={styles.OrderInfo}
        dialogClassName={styles.OrderInfoDialog}
        show={this.props.show}
        onHide={this.props.onHide}
        centered={true}
        size="lg"
      >
        <div className={styles.CloseButton} onClick={this.props.onHide}>
          <FaTimes size={10} />
        </div>
        <Modal.Body className={styles.ModalBody}>
          <div className={styles.OrderInfoTable}>
            <div className={styles.OrderInfoTitle}>{t('Order Info')}</div>
            <table>
              <tbody>
                <tr>
                  <td>{`${t('Account No')}:`}</td>
                  <td>{data?.accountNumber || '--'}</td>
                  <td>{`${t('Order Price')}:`}</td>
                  <td>{formatNumber(data?.orderPrice, 2) || '--'}</td>
                  <td>{`${t('Order Status')}:`}</td>
                  <td className={classNames('')}>
                    {t(data?.orderStatus ?? '--')}
                  </td>
                  <td>{`${t('Order ID')}:`}</td>
                  <td>{data?.orderNumber || '--'}</td>
                </tr>
                <tr>
                  <td>{`${t('Stock Symbol')}:`}</td>
                  <td>{data?.symbol || '--'}</td>
                  <td>{`${t('Order Quantity')}:`}</td>
                  <td>{formatNumber(data?.orderQuantity) || '--'}</td>
                  <td>{`${t('Unmatched Qty')}:`}</td>
                  <td>{formatNumber(data?.unmatchedQuantity) || '--'}</td>
                  <td>{`${t('Order Time')}:`}</td>
                  <td>
                    {formatDateToDisplay(
                      data?.orderTime,
                      'HH:mm:ss dd/MM/yyyy',
                      'yyyyMMddHHmmss',
                      this.props.selectedAccount?.type === SystemType.EQUITY
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{`${t('Order Side')}:`}</td>
                  <td
                    className={classNames({
                      [globalStyles.Up]: data?.sellBuyType === SellBuyType.BUY,
                      [globalStyles.Down]:
                        data?.sellBuyType === SellBuyType.SELL,
                    })}
                  >
                    {data?.sellBuyType || '--'}
                  </td>
                  <td>{`${t('Matched Price')}:`}</td>
                  <td>{formatNumber(data?.matchedPrice) || '--'}</td>
                  <td>{`${t('Canceled Qty')}:`}</td>
                  <td>{formatNumber(data?.canceledQty) || '--'}</td>
                  <td>{`${t('Channel')}:`}</td>
                  <td>{data?.channel || '--'}</td>
                </tr>
                <tr>
                  <td>{`${t('Order Type')}:`}</td>
                  <td>{data?.orderType || '--'}</td>
                  <td>{`${t('Matched Qty')}:`}</td>
                  <td>{formatNumber(data?.matchedQuantity) || '--'}</td>
                  <td>{`${t('Validity')}:`}</td>
                  <td>{data?.validity || '--'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.OrderLog}>
            <div className={styles.OrderLogTitle}>{t('Order Log')}</div>
            <div className={styles.OrderLogTable}>
              <SheetData
                rowData={this.props.orderBookDetail.data}
                columnDefs={config.getColumnDef()}
                status={this.props.orderBookDetail.status}
                defaultColDef={config.DEFAULT_COL_DEF}
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  orderBookDetail: state.orderBookDetail,
});

const mapDispatchToProps = { queryOrderBookDetail };

const OrderInfo = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OrderInfoComponent)
  ),
  Fallback,
  handleError
);

export default OrderInfo;
