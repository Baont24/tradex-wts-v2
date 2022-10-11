import * as React from 'react';
import {
  DerivativesConditionalType,
  IOrderForm,
  IOrderFormConfig,
} from './config';
import { Fallback } from 'components/common';
import { Formik } from 'formik';
import { IFormProps, TMutable } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import {
  Market,
  MarketStatus,
  OrderFormViewMode,
  OrderKind,
  OrderType,
  RealtimeChannelDataType,
  SellBuyType,
  StopOrderType,
  SymbolType,
  SystemType,
} from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  changeAccount,
  setCurrentSymbol,
  subscribe,
  unsubscribe,
} from 'redux/global-actions';
import { connect } from 'react-redux';
import { formatDateToString, formatStringToDate } from 'utils/datetime';
import { getMinLot } from 'utils/market';
import { handleError } from 'utils/common';
import {
  placeDerivativesOrder,
  placeOrder,
  placeStopOrder,
  queryOrderStockInfo,
} from './actions';
import { withErrorBoundary } from 'react-error-boundary';
import Form from './form';

const MAX_VOLUME = 500000;

interface IOrderFormProps
  extends React.ClassAttributes<OrderFormComponent>,
    WithNamespaces {
  readonly currentSymbol: IState['currentSymbol'];
  readonly currentSymbolData: IState['currentSymbolData'];
  readonly marketStatus: IState['marketStatus'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly orderStockInfo: IState['orderStockInfo'];
  readonly symbolList: IState['symbolList'];
  readonly sideBarFunction: IState['sideBarFunction'];
  readonly placeOrderResult: IState['placeOrderResult'];
  readonly config: IOrderFormConfig;
  readonly orderKind: OrderKind;
  readonly viewMode?: OrderFormViewMode;

  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly changeAccount: typeof changeAccount;
  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
  readonly placeOrder: typeof placeOrder;
  readonly placeDerivativesOrder: typeof placeDerivativesOrder;
  readonly queryOrderStockInfo: typeof queryOrderStockInfo;
  readonly placeStopOrder: typeof placeStopOrder;
}

interface IOrderFormState {
  readonly initialValues: IOrderForm;
  readonly isFormDisabled?: boolean;
  readonly isConfirmModalOpened?: boolean;
}

class OrderFormComponent extends React.Component<
  IOrderFormProps,
  IOrderFormState
> {
  private formRef: React.RefObject<IFormProps<IOrderForm>>;

  constructor(props: IOrderFormProps) {
    super(props);

    this.state = {
      initialValues:
        props.sideBarFunction.orderForm != null
          ? this.getInitialValue(
              props.sideBarFunction.orderForm.accountNumber,
              props.sideBarFunction.orderForm.stockCode,
              props.sideBarFunction.orderForm.currentPrice,
              props.sideBarFunction.orderForm.sellBuyType,
              props.sideBarFunction.orderForm.skipConfirmation,
              props.sideBarFunction.orderForm.expiryDate,
              props.sideBarFunction.orderForm
            )
          : this.getInitialValue(
              props.selectedAccount?.accountNumber || '',
              props.currentSymbol.code,
              props.currentSymbol.infoData?.c
            ),
    };

    this.formRef = React.createRef();
  }

  static getDerivedStateFromProps(
    nextProps: IOrderFormProps
  ): Partial<IOrderFormState> | null {
    return {
      isFormDisabled:
        (nextProps.selectedAccount?.type === SystemType.DERIVATIVES &&
          nextProps.currentSymbol.symbolType !== SymbolType.FUTURES) ||
        (nextProps.selectedAccount?.type === SystemType.EQUITY &&
          nextProps.currentSymbol.symbolType === SymbolType.FUTURES) ||
        nextProps.currentSymbol.symbolType === SymbolType.INDEX,
    };
  }

  componentDidMount() {
    const { currentSymbolData, sideBarFunction, symbolList } = this.props;
    if (currentSymbolData) {
      const code = sideBarFunction.orderForm?.stockCode || currentSymbolData.s;
      this.props.setCurrentSymbol({
        code,
        forceUpdate: true,
        resetData: true,
      });
      this.props.subscribe({
        symbolList: [symbolList.map?.[code] || currentSymbolData],
        types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
      });
    }
  }

  componentDidUpdate(prevProps: IOrderFormProps) {
    if (
      (prevProps.currentSymbol !== this.props.currentSymbol &&
        prevProps.currentSymbol.code !== this.props.currentSymbol.code) ||
      prevProps.selectedAccount !== this.props.selectedAccount
    ) {
      if (this.props.currentSymbol.infoData) {
        this.props.subscribe({
          symbolList: [this.props.currentSymbol.infoData],
          types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
        });
      }
      if (prevProps.currentSymbol.infoData) {
        this.props.unsubscribe({
          symbolList: [prevProps.currentSymbol.infoData],
          types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
        });
      }
      const orderPrice =
        this.props.currentSymbol.infoData?.c ||
        this.props.currentSymbol.infoData?.re;
      this.queryOrderStockInfo(
        this.props.selectedAccount,
        this.props.currentSymbol.code,
        this.props.currentSymbol.infoData?.m,
        orderPrice,
        this.props.sideBarFunction && this.props.sideBarFunction.orderForm
          ? this.props.sideBarFunction.orderForm.sellBuyType
          : this.formRef.current?.values.sellBuyType
      );
    }

    if (
      prevProps.currentSymbol !== this.props.currentSymbol &&
      prevProps.currentSymbol.code === this.props.currentSymbol.code
    ) {
      const orderPrice =
        this.props.currentSymbol.infoData?.c ||
        this.props.currentSymbol.infoData?.re;
      this.queryOrderStockInfo(
        this.props.selectedAccount,
        this.props.currentSymbol.code,
        this.props.currentSymbol.infoData?.m,
        orderPrice,
        this.formRef.current?.values.sellBuyType
      );
    }

    if (
      (this.props.config !== prevProps.config ||
        prevProps.currentSymbol !== this.props.currentSymbol) &&
      this.props.selectedAccount != null
    ) {
      const initialValues: IOrderForm = this.getInitialValue(
        this.props.selectedAccount.accountNumber,
        this.props.currentSymbol.code,
        this.props.currentSymbol.infoData?.c,
        this.formRef.current?.values.sellBuyType,
        this.formRef.current?.values.skipConfirmation,
        this.props.selectedAccount?.type !== SystemType.DERIVATIVES
          ? this.formRef.current?.values.expiryDate
          : undefined,
        this.props.sideBarFunction.orderForm
      );
      this.formRef.current?.setValues(initialValues, true);
    }

    if (
      this.props.sideBarFunction !== prevProps.sideBarFunction &&
      this.props.sideBarFunction.orderForm != null &&
      this.props.selectedAccount != null
    ) {
      const initialValues: IOrderForm = this.getInitialValue(
        this.props.selectedAccount.accountNumber,
        this.props.currentSymbol.code,
        this.props.currentSymbol.infoData?.c,
        this.formRef.current?.values.sellBuyType,
        this.formRef.current?.values.skipConfirmation,
        this.formRef.current?.values.expiryDate,
        this.props.sideBarFunction.orderForm
      );
      this.formRef.current?.setValues(initialValues, true);

      this.props.setCurrentSymbol({
        code: this.props.sideBarFunction.orderForm.stockCode,
        forceUpdate: true,
        resetData: true,
      });
    }

    if (
      this.props.placeOrderResult !== prevProps.placeOrderResult &&
      (this.props.placeOrderResult.status.isSucceeded ||
        this.props.placeOrderResult.status.isFailed)
    ) {
      const orderPrice =
        this.formRef.current?.values.orderPrice ||
        this.props.currentSymbol.infoData?.c ||
        this.props.currentSymbol.infoData?.re;
      this.queryOrderStockInfo(
        this.props.selectedAccount,
        this.props.currentSymbol.code,
        this.props.currentSymbol.infoData?.m,
        orderPrice,
        this.formRef.current?.values.sellBuyType
      );
    }
  }

  componentWillUnmount() {
    if (this.props.currentSymbol.infoData) {
      this.props.unsubscribe({
        symbolList: [this.props.currentSymbol.infoData],
        types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
      });
    }
  }

  render() {
    if (this.props.selectedAccount?.accountNumber == null) {
      return null;
    }
    return (
      <Formik
        initialValues={this.state.initialValues}
        onSubmit={this.onSubmit}
        innerRef={this.formRef}
        validate={this.onValidate}
        validateOnMount={true}
      >
        {(props) => (
          <Form
            {...props}
            onSymbolSearch={this.onSymbolSearch}
            config={this.props.config}
            disabled={this.state.isFormDisabled}
            orderKind={this.props.orderKind}
            viewMode={this.props.viewMode}
          />
        )}
      </Formik>
    );
  }

  private onValidate = (values: IOrderForm) => {
    const { t, marketStatus } = this.props;
    const today = new Date();
    const status =
      marketStatus.length === 0 ||
      marketStatus.some((ele) => ele.status !== MarketStatus.CLOSED);
    const mutableErrors: TMutable<IFormProps<IOrderForm>['errors']> = {};

    const validatePrice = (price: number, ce?: number, fl?: number) => {
      let message;
      if (ce != null && price > ce) {
        message = 'Price must be less than ceiling price';
      }
      if (fl != null && price < fl) {
        message = 'Price must be greater than floor price';
      }
      return message;
    };
    if (this.props.orderKind === OrderKind.NORMAL_ORDER) {
      let message;
      if (values.orderPrice != null) {
        if (values.orderPrice < 0) {
          message = validatePrice(
            values.orderPrice,
            values.ceilingPrice,
            values.floorPrice
          );
        }
        if (values.expiryDate != null) {
          const checkTime =
            formatStringToDate(values.expiryDate).getTime() <= today.getTime();
          message =
            checkTime && status
              ? validatePrice(
                  values.orderPrice,
                  values.ceilingPrice,
                  values.floorPrice
                )
              : null;
        } else {
          message = status
            ? validatePrice(
                values.orderPrice,
                values.ceilingPrice,
                values.floorPrice
              )
            : null;
        }
        if (message != null) {
          mutableErrors.orderPrice = t(message);
        }
      }
    }

    if (
      (this.props.orderKind === OrderKind.STOP_LIMIT_ORDER &&
        values.startDate === formatDateToString(today)) ||
      (this.props.orderKind === OrderKind.CONDITIONAL_ORDER &&
        values.startDate === formatDateToString(today))
    ) {
      if (values.orderPrice != null) {
        const message = validatePrice(
          values.orderPrice,
          values.ceilingPrice,
          values.floorPrice
        );
        if (message != null) {
          mutableErrors.orderPrice = t(message);
        }
      }
    }
    if (
      (this.props.orderKind === OrderKind.STOP_LIMIT_ORDER ||
        this.props.orderKind === OrderKind.CONDITIONAL_ORDER) &&
      values.stopPrice != null
    ) {
      const message = validatePrice(
        values.stopPrice,
        values.ceilingPrice,
        values.floorPrice
      );
      if (message != null) {
        mutableErrors.stopPrice = t(message);
      }
      if (values.currentPrice) {
        if (
          values.sellBuyType === SellBuyType.BUY &&
          values.stopPrice <= values.currentPrice
        ) {
          mutableErrors.stopPrice = t(
            'Price must be greater than current price'
          );
        }
        if (
          values.sellBuyType === SellBuyType.SELL &&
          values.stopPrice >= values.currentPrice
        ) {
          mutableErrors.stopPrice = t('Price must be less than current price');
        }
      } else if (!values.currentPrice && values.referencePrice != null) {
        if (
          values.sellBuyType === SellBuyType.BUY &&
          values.stopPrice <= values.referencePrice
        ) {
          mutableErrors.stopPrice = t(
            'Price must be greater than reference price'
          );
        }
        if (
          values.sellBuyType === SellBuyType.SELL &&
          values.stopPrice >= values.referencePrice
        ) {
          mutableErrors.stopPrice = t(
            'Price must be less than reference price'
          );
        }
      }
    }

    if (values.triggerPrice != null) {
      const message = validatePrice(
        values.triggerPrice,
        values.ceilingPrice,
        values.floorPrice
      );
      if (message != null) {
        mutableErrors.triggerPrice = t(message);
      }
    }

    if (values.lossPrice != null) {
      const message = validatePrice(
        values.lossPrice,
        values.ceilingPrice,
        values.floorPrice
      );
      if (message != null) {
        mutableErrors.lossPrice = t(message);
      }
    }

    if (values.profitPrice != null) {
      const message = validatePrice(
        values.profitPrice,
        values.ceilingPrice,
        values.floorPrice
      );
      if (message != null) {
        mutableErrors.profitPrice = t(message);
      }
    }
    if (
      values.orderQuantity != null &&
      (this.props.orderStockInfo.status.isSucceeded ||
        this.props.orderStockInfo.status.isFailed)
    ) {
      if (values.orderQuantity > MAX_VOLUME) {
        mutableErrors.orderQuantity = t(
          'Trading lots must be not greater than 500,000'
        );
      }

      if (values.orderQuantity <= 0) {
        mutableErrors.orderQuantity = t('Quantity must be greater than 0');
      }
      if (
        this.props.orderKind !== OrderKind.STOP_LIMIT_ORDER &&
        this.props.orderKind !== OrderKind.CONDITIONAL_ORDER &&
        this.props.orderStockInfo.data?.maxQty != null &&
        values.orderQuantity > this.props.orderStockInfo.data?.maxQty &&
        values.orderType !== OrderType.ODDLOT
      ) {
        mutableErrors.orderQuantity =
          values.sellBuyType === SellBuyType.BUY
            ? t('Insufficient buying power')
            : t('Insufficient available stock quantity');
      }
    }

    if (values.triggerPrice != null && values.currentPrice != null) {
      if (
        (values.conditionalType === DerivativesConditionalType.UP ||
          values.conditionalType === DerivativesConditionalType.TRAILING_UP) &&
        values.triggerPrice < values.currentPrice
      ) {
        mutableErrors.triggerPrice = t(
          'Trigger Price must be greater than Current Price'
        );
      }

      if (
        (values.conditionalType === DerivativesConditionalType.DOWN ||
          values.conditionalType ===
            DerivativesConditionalType.TRAILING_DOWN) &&
        values.triggerPrice > values.currentPrice
      ) {
        mutableErrors.triggerPrice = t(
          'Trigger Price must be less than Current Price'
        );
      }
    }

    return mutableErrors;
  };

  private onSubmit = (values: IOrderForm) => {
    if (this.state.isFormDisabled) {
      console.log('Form is disabled');
      return;
    }

    if (this.props.currentSymbol.infoData?.m) {
      if (this.props.currentSymbol.symbolType === SymbolType.FUTURES) {
        if (this.props.orderKind === OrderKind.CONDITIONAL_ORDER) {
          if (
            values.conditionalType === DerivativesConditionalType.STOP_LIMIT
          ) {
            this.props.placeStopOrder({
              accountNumber: values.accountNumber,
              code: values.stockCode,
              orderPrice: values.orderPrice || undefined,
              orderQuantity: values.orderQuantity,
              orderType: values.orderPrice
                ? StopOrderType.STOP_LIMIT
                : StopOrderType.STOP,
              sellBuyType: values.sellBuyType,
              fromDate:
                values.startDate || formatDateToString(new Date()) || '',
              toDate: values.endDate || formatDateToString(new Date()) || '',
              stopPrice: values.stopPrice || 0,
            });
          }
        } else {
          this.props.placeDerivativesOrder(
            {
              accountNumber: values.accountNumber,
              code: values.stockCode,
              orderPrice: values.orderPrice || 0,
              orderQuantity: values.orderQuantity,
              orderType: values.orderType,
              sellBuyType: values.sellBuyType,
              expiryDate: values.expiryDate,
            },
            this.props.orderKind
          );
        }
      } else {
        if (this.props.orderKind === OrderKind.STOP_LIMIT_ORDER) {
          this.props.placeStopOrder({
            accountNumber: values.accountNumber,
            code: values.stockCode,
            orderPrice: values.orderPrice || undefined,
            orderQuantity: values.orderQuantity,
            orderType: values.orderPrice
              ? StopOrderType.STOP_LIMIT
              : StopOrderType.STOP,
            sellBuyType: values.sellBuyType,
            fromDate: values.startDate || formatDateToString(new Date()) || '',
            toDate: values.endDate || formatDateToString(new Date()) || '',
            stopPrice: values.stopPrice || 0,
          });
        } else {
          this.props.placeOrder(
            {
              accountNumber: values.accountNumber,
              code: values.stockCode,
              marketType: this.props.currentSymbol.infoData.m,
              orderPrice: values.orderPrice || 0,
              orderQuantity: values.orderQuantity,
              orderType: values.orderType,
              sellBuyType: values.sellBuyType,
              expiryDate: values.expiryDate,
            },
            this.props.orderKind
          );
        }
      }
    }
  };

  private onSymbolSearch = (code: string | null) => {
    if (code != null) {
      this.props.setCurrentSymbol({ code, forceUpdate: true });
      if (this.props.selectedAccount != null) {
        const initialValues: IOrderForm = this.getInitialValue(
          this.props.selectedAccount.accountNumber,
          code,
          this.props.currentSymbol.infoData?.c,
          this.formRef.current?.values.sellBuyType,
          this.formRef.current?.values.skipConfirmation,
          this.formRef.current?.values.expiryDate,
          this.props.sideBarFunction.orderForm
        );
        this.formRef.current?.setValues(initialValues, true);
      }
    }
  };

  private queryOrderStockInfo = (
    account: IState['selectedAccount'],
    symbolCode?: string,
    market?: Market,
    price?: number,
    sellBuyType?: SellBuyType
  ) => {
    if (
      account != null &&
      symbolCode != null &&
      market != null &&
      price != null &&
      sellBuyType != null
    ) {
      this.props.queryOrderStockInfo({
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        symbolCode,
        market,
        price,
        sellBuyType,
      });
    }
  };

  private getInitialValue = (
    accountNumber: string,
    code: string,
    currentPrice?: number,
    sellBuyType = SellBuyType.BUY,
    skipConfirmation = false,
    expiryDate?: string,
    initialOrderForm?: IOrderForm
  ): IOrderForm => {
    const symbol = this.props.symbolList.map?.[code];
    const orderPrice = currentPrice || symbol?.re;
    const orderQuantity = getMinLot(symbol?.m, symbol?.t);
    return {
      stockCode: code,
      accountNumber,
      sellBuyType,
      orderPrice,
      orderQuantity,
      tradingValue:
        orderPrice && orderQuantity ? orderPrice * orderQuantity : undefined,
      orderType: OrderType.LO,
      ceilingPrice: symbol?.ce,
      floorPrice: symbol?.fl,
      referencePrice: symbol?.re,
      market: symbol?.m,
      symbolType: symbol?.t,
      currentPrice,
      skipConfirmation,
      orderQuantityType: 'share',
      startDate: formatDateToString(new Date()),
      endDate: formatDateToString(new Date()),
      stopPrice: orderPrice,
      conditionalType: DerivativesConditionalType.STOP_LIMIT,
      expiryDate,
      ...(initialOrderForm?.stockCode === code && initialOrderForm),
    };
  };
}

const mapStateToProps = (state: IState) => ({
  currentSymbol: state.currentSymbol,
  currentSymbolData: state.currentSymbolData,
  selectedAccount: state.selectedAccount,
  orderStockInfo: state.orderStockInfo,
  symbolList: state.symbolList,
  sideBarFunction: state.sideBarFunction,
  placeOrderResult: state.placeOrderResult,
  marketStatus: state.marketStatus,
});

const mapDispatchToProps = {
  setCurrentSymbol,
  changeAccount,
  subscribe,
  unsubscribe,
  placeOrder,
  placeDerivativesOrder,
  queryOrderStockInfo,
  placeStopOrder,
};

const OrderForm = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OrderFormComponent)
  ),
  Fallback,
  handleError
);

export { watchGetOrderStockInfo as getOrderStockInfo } from './sagas';

export default OrderForm;
