import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { Formik } from 'formik';
import { IFormProps, TMutable } from 'interfaces/common';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { IStopOrderHistoryResponse } from 'interfaces/api';
import {
  MarketStatus,
  OrderFormActionMode,
  OrderKind,
  OrderType,
  SellBuyType,
  StopOrderType,
  SystemType,
} from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  cancelDerivativesOrder,
  cancelOrder,
  cancelStopOrder,
  modifyDerivativesOrder,
  modifyOrder,
  modifyStopOrder,
} from '../OrderForm/actions';
import { connect } from 'react-redux';
import { formatStringToDate } from 'utils/datetime';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Form from './form';
import OtpModal from '../OtpModal';

interface IModifyOrderFormProps
  extends React.ClassAttributes<ModifyOrderFormComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly symbolList: IState['symbolList'];
  readonly orderStockInfo: IState['orderStockInfo'];
  readonly action: OrderFormActionMode;
  readonly data?: IStopOrderHistoryResponse | IOrderBookReducer;
  readonly show?: boolean;
  readonly orderKind?: OrderKind;
  readonly currentSymbol: IState['currentSymbol'];
  readonly marketStatus: IState['marketStatus'];
  readonly orderStockInfoModal: IState['orderStockInfoModal'];

  readonly onHide?: () => void;
  readonly onSubmit?: () => void;
  readonly modifyOrder: typeof modifyOrder;
  readonly cancelOrder: typeof cancelOrder;
  readonly modifyStopOrder: typeof modifyStopOrder;
  readonly cancelStopOrder: typeof cancelStopOrder;
  readonly modifyDerivativesOrder: typeof modifyDerivativesOrder;
  readonly cancelDerivativesOrder: typeof cancelDerivativesOrder;
}

class ModifyOrderFormComponent extends React.Component<IModifyOrderFormProps> {
  private formRef: React.RefObject<
    IFormProps<IStopOrderHistoryResponse | IOrderBookReducer>
  >;

  constructor(props: IModifyOrderFormProps) {
    super(props);

    this.state = {};

    this.formRef = React.createRef();
  }

  render() {
    const { data } = this.props;
    return data ? (
      <OtpModal
        className={styles.ModifyOrderModal}
        show={this.props.show}
        onHide={this.props.onHide}
        onSubmit={this.onModalSubmit}
      >
        <Formik
          initialValues={data}
          onSubmit={this.onSubmit}
          validate={this.onValidate}
          innerRef={this.formRef}
          initialTouched={{ orderPrice: true, orderQty: true }}
        >
          {(props) => (
            <Form
              {...props}
              action={this.props.action}
              orderKind={this.props.orderKind}
            />
          )}
        </Formik>
      </OtpModal>
    ) : null;
  }

  private onSubmit = (
    values: IStopOrderHistoryResponse | IOrderBookReducer
  ) => {
    const symbolCode =
      (this.props.data as IOrderBookReducer)?.symbol ||
      (this.props.data as IStopOrderHistoryResponse)?.code;
    const market = this.props.symbolList.map?.[symbolCode || '']?.m;
    const isDerivatives =
      this.props.selectedAccount?.type === SystemType.DERIVATIVES;
    const orderQuantity = values.orderQuantity;

    if (this.props.data != null && market != null) {
      if (this.props.orderKind === OrderKind.STOP_LIMIT_ORDER) {
        const params = values as IStopOrderHistoryResponse;
        if (this.props.action === OrderFormActionMode.MODIFY) {
          this.props.modifyStopOrder({
            stopOrderId: params.stopOrderId,
            orderPrice: params.orderPrice || null,
            orderQuantity,
            stopPrice: params.stopPrice,
            fromDate: params.fromDate,
            toDate: params.toDate,
          });
        } else if (this.props.action === OrderFormActionMode.CANCEL) {
          this.props.cancelStopOrder({
            idList: [`${params.stopOrderId}`],
          });
        }
      } else {
        if (this.props.action === OrderFormActionMode.MODIFY) {
          if (isDerivatives) {
            const params = values as IOrderBookReducer;
            this.props.modifyDerivativesOrder({
              accountNumber: params.accountNumber,
              orderPrice: params.orderPrice || 0,
              orderQty: orderQuantity,
              orderInfo: {
                marketID: params.marketID ?? '',
                symbol: params.symbol,
                commodityName: params.commodityName ?? '',
                contractMonth: params.contractMonth ?? '',
                orderNumber: params.orderNumber ?? '',
                validity: params.validity,
                orderType: params.orderType,
                orderGroupID: params.orderGroupID,
                sellBuyType: params.sellBuyType,
                conditionOrderGroupID: params.conditionOrderGroupID ?? '',
                validityDate: params.validityDate ?? '',
                matchedQuantity: params.matchedQuantity,
                position: params.position ?? '',
                minQty: params.minQty ?? 0,
                stopType: params.stopType ?? '',
                stopPrice: params.stopPrice ?? 0,
                tPlus1: params.tPlus1 ?? false,
                userID: params.userID ?? '',
                stopOrder: params.stopOrder ?? false,
                auctionOrder: params.auctionOrder ?? false,
              },
            });
          } else {
            const params = values as IOrderBookReducer;
            this.props.modifyOrder({
              accountNo: params.accountNumber,
              market,
              newPrice: params.orderPrice,
              newQuantity: orderQuantity,
              orderGroupNo: params.orderGroupNo ?? '',
              orderNo: params.orderNumber ?? '',
              originalQuantity: (this.props.data as IOrderBookReducer)
                .orderQuantity,
              stockSymbol: params.symbol,
            });
          }
        } else if (this.props.action === OrderFormActionMode.CANCEL) {
          if (isDerivatives) {
            const params = values as IOrderBookReducer;
            this.props.cancelDerivativesOrder({
              accountNumber: params.accountNumber,
              orderInfo: [
                {
                  commodityName: params.commodityName ?? '',
                  contractMonth: params.contractMonth ?? '',
                  marketID: params.marketID ?? '',
                  orderGroupID: params.orderGroupID,
                  orderNumber: params.orderNumber ?? '',
                  orderType: params.orderType,
                  sellBuyType: params.sellBuyType,
                  symbolCode: params.symbol,
                  validity: params.validity,
                  validityDate: params.validityDate ?? '',
                },
              ],
            });
          } else {
            const params = values as IOrderBookReducer;
            this.props.cancelOrder({
              accountNo: params.accountNumber,
              orders: [
                {
                  orderNo: params.orderNumber ?? '',
                  orderGroupNo: params.orderGroupNo ?? '',
                },
              ],
            });
          }
        }
      }
    }
    this.props.onSubmit?.();
  };

  private onModalSubmit = () => {
    if (this.formRef.current?.isValid) {
      this.formRef.current?.submitForm();
    }
  };

  private onValidate = (
    values: IStopOrderHistoryResponse | IOrderBookReducer
  ) => {
    const { t, marketStatus } = this.props;
    const today = new Date();
    const status =
      marketStatus.length === 0 ||
      marketStatus.some((ele) => ele.status !== MarketStatus.CLOSED);
    const mutableErrors: TMutable<
      IFormProps<IStopOrderHistoryResponse | IOrderBookReducer>['errors']
    > = {};
    const symbolCode =
      (values as IOrderBookReducer).symbol ||
      (values as IStopOrderHistoryResponse).code;
    const orderQuantity = (values as IOrderBookReducer).orderQuantity;
    const maxQty =
      this.props.orderStockInfoModal.data?.maxQty != null &&
      this.props.data != null
        ? this.props.orderStockInfoModal.data.maxQty +
          this.props.data.orderQuantity
        : null;
    const validity = (values as IOrderBookReducer).validity;
    const checkTime = validity
      ? formatStringToDate(validity).getTime() <= today.getTime()
      : null;

    if (this.props.action === OrderFormActionMode.MODIFY) {
      const ce = this.props.symbolList.map?.[symbolCode]?.ce;
      const fl = this.props.symbolList.map?.[symbolCode]?.fl;
      const re = this.props.symbolList.map?.[symbolCode]?.re;
      const c = this.props.currentSymbol.infoData?.c;

      const isOrderType =
        values.orderType !== OrderType.LO &&
        values.orderType !== OrderType.ODDLOT;
      const orderKind = this.props.orderKind === OrderKind.STOP_LIMIT_ORDER;

      const validatePrice = (ce?: number, fl?: number) => {
        let message;
        if (
          (ce != null && values.orderPrice > ce && !isOrderType) ||
          (ce != null && values.orderPrice > ce && orderKind)
        ) {
          message = t('Price must be less than ceiling price');
        }
        if (
          (fl != null && values.orderPrice < fl && !isOrderType) ||
          (fl != null && values.orderPrice < fl && orderKind)
        ) {
          message = t('Price must be greater than floor price');
        }
        return message;
      };

      if (values.orderType === OrderType.ODDLOT) {
        if (values.orderQuantity > 99) {
          mutableErrors.orderQuantity = t('Quantity must be smaller than 100.');
        }
      }

      if (values.orderType !== StopOrderType.STOP) {
        if (
          (!values.orderPrice &&
            values.orderType !== OrderType.ATC &&
            values.orderType !== OrderType.MTL &&
            values.orderType !== OrderType.ATO &&
            values.orderType !== OrderType.MAK &&
            values.orderType !== OrderType.MOK) ||
          values.orderPrice < 0
        ) {
          mutableErrors.orderPrice = t('Price must be greater than 0');
        } else {
          let message;
          if (validity) {
            message = checkTime && status ? validatePrice(ce, fl) : null;
          } else {
            message = status ? validatePrice(ce, fl) : null;
          }
          if (message != null) {
            mutableErrors.orderPrice = t(message);
          }
        }
      }

      if (orderQuantity != null) {
        if (orderQuantity === 0) {
          mutableErrors.orderQuantity = t('Quantity must be greater than 0');
        }
        if (
          this.props.orderKind !== OrderKind.STOP_LIMIT_ORDER &&
          values.orderType !== OrderType.ODDLOT &&
          maxQty != null &&
          orderQuantity > maxQty
        ) {
          mutableErrors.orderQuantity =
            values.sellBuyType === SellBuyType.BUY
              ? t('Insufficient buying power')
              : t('Insufficient available stock quantity');
        }
      }
      if (
        this.props.orderKind === OrderKind.STOP_LIMIT_ORDER ||
        this.props.orderKind === OrderKind.CONDITIONAL_ORDER
      ) {
        if (values.stopPrice != null) {
          if (values.sellBuyType === SellBuyType.BUY) {
            if (c) {
              values.stopPrice <= c
                ? (mutableErrors.stopPrice = t(
                    'Price must be greater than current price'
                  ))
                : ce != null &&
                  values.stopPrice > ce &&
                  (mutableErrors.stopPrice = t(
                    'Price must be less than ceiling price'
                  ));
            } else if (re != null && values.stopPrice <= re) {
              mutableErrors.stopPrice = t(
                'Price must be greater than reference price'
              );
            }
          }
          if (values.sellBuyType === SellBuyType.SELL) {
            if (c) {
              values.stopPrice >= c
                ? (mutableErrors.stopPrice = t(
                    'Price must be less than current price'
                  ))
                : fl != null &&
                  values.stopPrice < fl &&
                  (mutableErrors.stopPrice = t(
                    'Price must be greater than floor price'
                  ));
            } else if (re != null && values.stopPrice >= re) {
              mutableErrors.stopPrice = t(
                'Price must be less than reference price'
              );
            }
          }
        } else {
          mutableErrors.stopPrice = t('Price must be greater than 0');
        }
      }
    }

    return mutableErrors;
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  symbolList: state.symbolList,
  orderStockInfo: state.orderStockInfo,
  currentSymbol: state.currentSymbol,
  marketStatus: state.marketStatus,
  orderStockInfoModal: state.orderStockInfoModal,
});

const mapDispatchToProps = {
  modifyOrder,
  cancelOrder,
  cancelStopOrder,
  modifyStopOrder,
  modifyDerivativesOrder,
  cancelDerivativesOrder,
};

const ModifyOrderForm = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(ModifyOrderFormComponent)
  ),
  Fallback,
  handleError
);

export default ModifyOrderForm;
