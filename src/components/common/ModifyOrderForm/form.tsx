import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { DATE_FORMAT_DISPLAY } from 'constants/main';
import { ErrorMessage, Form } from 'formik';
import { Fallback } from 'components/common';
import { IFormProps } from 'interfaces/common';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { IStopOrderHistoryResponse } from 'interfaces/api';
import {
  Market,
  OrderFormActionMode,
  OrderKind,
  OrderStatusResponse,
  OrderType,
  SellBuyType,
  StopOrderType,
  SystemType,
} from 'constants/enum';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import {
  formatDateToDisplay,
  formatDateToString,
  formatStringToDate,
} from 'utils/datetime';
import { formatNumber, handleError, nameof } from 'utils/common';
import { queryOrderStockInfo } from '../OrderForm/actions';
import { setCurrentSymbol } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import DatePicker from '../DatePicker';
import PriceInput from '../PriceInput';
import QuantityInput from '../QuantityInput';

interface IModifyOrderFormProps
  extends React.ClassAttributes<ModifyOrderFormComponent>,
    WithNamespaces,
    IFormProps<IStopOrderHistoryResponse | IOrderBookReducer> {
  readonly orderStockInfoModal: IState['orderStockInfoModal'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly symbolList: IState['symbolList'];
  readonly action: OrderFormActionMode;
  readonly orderKind?: OrderKind;

  readonly queryOrderStockInfo: typeof queryOrderStockInfo;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
}

class ModifyOrderFormComponent extends React.Component<IModifyOrderFormProps> {
  constructor(props: IModifyOrderFormProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (this.props.action === OrderFormActionMode.MODIFY) {
      this.queryOrderStockInfo();
    }
  }

  render() {
    const { t, values, action, orderKind, errors } = this.props;
    const isOrderType =
      values.orderType !== OrderType.LO &&
      values.orderType !== OrderType.ODDLOT;
    const isOddlot = values.orderType === OrderType.ODDLOT;
    const isDerivatives =
      this.props.selectedAccount?.type === SystemType.DERIVATIVES;
    const isStopLimitOrder = orderKind === OrderKind.STOP_LIMIT_ORDER;
    const symbolCode =
      (values as IOrderBookReducer).symbol ||
      (values as IStopOrderHistoryResponse).code;
    const fromDate = (values as IStopOrderHistoryResponse).fromDate;
    const toDate = (values as IStopOrderHistoryResponse).toDate;
    const maxQty =
      this.props.orderStockInfoModal.data?.maxQty != null &&
      this.props.initialValues != null
        ? this.props.orderStockInfoModal.data.maxQty +
          this.props.initialValues.orderQuantity
        : undefined;

    return (
      <Form className={styles.ModifyOrderForm}>
        <div className={styles.ModalTitle}>
          {isStopLimitOrder
            ? t(
                action === OrderFormActionMode.MODIFY
                  ? t('Modify stop limit order')
                  : t('Cancel stop limit order')
              )
            : t(
                action === OrderFormActionMode.MODIFY
                  ? t('Modify normal order')
                  : t('Cancel normal order')
              )}
        </div>
        <div className={styles.Table}>
          <div className={styles.TableRow}>
            <div className={styles.TableCell}>{t('Symbol Symbol')}</div>
            <div className={styles.TableCell}>{symbolCode || '--'}</div>
          </div>

          <div className={styles.TableRow}>
            <div className={styles.TableCell}>{t('Order Side')}</div>
            <div
              className={classNames({
                [globalStyles.Up]: values.sellBuyType === SellBuyType.BUY,
                [globalStyles.Down]: values.sellBuyType === SellBuyType.SELL,
              })}
            >
              {t(`${values.sellBuyType} 2`)}
            </div>
          </div>

          {!isStopLimitOrder && (
            <div className={styles.TableRow}>
              <div className={styles.TableCell}>{t('Order Type')}</div>
              <div className={styles.TableCell}>{values.orderType || '--'}</div>
            </div>
          )}

          <div className={styles.TableRow}>
            <div className={styles.TableCell}>{t('Order Quantity')}</div>
            <div className={classNames(styles.TableCell, styles.FormField)}>
              {action === OrderFormActionMode.MODIFY ? (
                <>
                  <QuantityInput
                    data={this.props.symbolList.map?.[symbolCode]}
                    disablePopup={true}
                    disableQuantityType={true}
                    value={values.orderQuantity}
                    onChange={this.onQuantityChange}
                    onBlur={this.onBlurQuantity}
                    error={errors.orderQuantity != null}
                    isOddlot={isOddlot}
                  />
                  {!isStopLimitOrder && (
                    <div className={styles.MaxQtt}>{`${t('Max Qtt: 1')}: ${
                      formatNumber(maxQty) ?? '--'
                    }`}</div>
                  )}

                  {errors.orderQuantity && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip
                          id={'tooltip-orderQuantity'}
                          className={styles.BoardTooltip}
                        >
                          {errors.orderQuantity}
                        </Tooltip>
                      }
                    >
                      <ErrorMessage
                        className={styles.FieldError}
                        name={nameof<IOrderBookReducer>('orderQuantity')}
                        component={'div'}
                      />
                    </OverlayTrigger>
                  )}
                </>
              ) : (
                formatNumber(
                  (values as IOrderBookReducer).orderStatus ===
                    OrderStatusResponse.PARTIALLY_FILLED ||
                    (values as IOrderBookReducer).orderStatus ===
                      OrderStatusResponse.FILLED_PARTLY
                    ? (values as IOrderBookReducer).unmatchedQuantity
                    : values.orderQuantity,
                  2
                ) || '--'
              )}
            </div>
          </div>

          {isStopLimitOrder && (
            <div className={styles.TableRow}>
              <div className={styles.TableCell}>{t('Stop Price')}</div>
              <div className={classNames(styles.TableCell, styles.FormField)}>
                {action === OrderFormActionMode.MODIFY ? (
                  <>
                    <PriceInput
                      data={this.props.symbolList.map?.[symbolCode]}
                      disableOrderType={true}
                      value={(values as IStopOrderHistoryResponse).stopPrice}
                      onChange={this.onChangeStopPrice}
                      orderKind={this.props.orderKind}
                      error={errors.stopPrice != null}
                    />
                    {errors.stopPrice && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip
                            id={'tooltip-orderPricetooltip-StopPrice'}
                            className={styles.BoardTooltip}
                          >
                            {errors.stopPrice}
                          </Tooltip>
                        }
                      >
                        <ErrorMessage
                          className={styles.FieldError}
                          name={nameof<IStopOrderHistoryResponse>('stopPrice')}
                          component={'div'}
                        />
                      </OverlayTrigger>
                    )}
                  </>
                ) : (
                  formatNumber(
                    (values as IStopOrderHistoryResponse).stopPrice,
                    2
                  ) || '--'
                )}
              </div>
            </div>
          )}
          {values.orderType !== StopOrderType.STOP ? (
            <div className={styles.TableRow}>
              <div className={styles.TableCell}>
                {isStopLimitOrder ? t('Limit Price') : t('Order Price')}
              </div>
              <div className={classNames(styles.TableCell, styles.FormField)}>
                {action === OrderFormActionMode.MODIFY ? (
                  <>
                    <PriceInput
                      data={this.props.symbolList.map?.[symbolCode]}
                      disableOrderType={true}
                      value={values.orderPrice}
                      onChange={this.onPriceChange}
                      onBlur={this.onBlurOrderPrice}
                      orderKind={this.props.orderKind}
                      error={errors.orderPrice != null}
                      orderType={
                        !isStopLimitOrder
                          ? (values as IOrderBookReducer).orderType
                          : undefined
                      }
                    />
                    {errors.orderPrice && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip
                            id={'tooltip-orderPrice'}
                            className={styles.BoardTooltip}
                          >
                            {errors.orderPrice}
                          </Tooltip>
                        }
                      >
                        <ErrorMessage
                          className={styles.FieldError}
                          name={nameof<IOrderBookReducer>('orderPrice')}
                          component={'div'}
                        />
                      </OverlayTrigger>
                    )}
                  </>
                ) : !isOrderType || orderKind ? (
                  formatNumber(values.orderPrice, 2)
                ) : (
                  '--'
                )}
              </div>
            </div>
          ) : null}

          {isStopLimitOrder && (
            <>
              <div className={styles.TableRow}>
                <div className={styles.TableCell}>{t('From Date')}</div>
                <div className={classNames(styles.TableCell, styles.FormField)}>
                  {action === OrderFormActionMode.MODIFY ? (
                    <DatePicker
                      selected={fromDate ? formatStringToDate(fromDate) : null}
                      startDate={fromDate ? formatStringToDate(fromDate) : null}
                      endDate={toDate ? formatStringToDate(toDate) : null}
                      selectsStart={true}
                      minDate={new Date()}
                      dateFormat={DATE_FORMAT_DISPLAY}
                      onChange={this.onChangeFromDate}
                      showMonthDropdown={true}
                      showYearDropdown={true}
                      dropdownMode="select"
                    />
                  ) : (
                    formatDateToDisplay(fromDate) || '--'
                  )}
                </div>
              </div>

              <div className={styles.TableRow}>
                <div className={styles.TableCell}>{t('To Date')}</div>
                <div className={classNames(styles.TableCell, styles.FormField)}>
                  {action === OrderFormActionMode.MODIFY ? (
                    <DatePicker
                      selected={toDate ? formatStringToDate(toDate) : null}
                      selectsEnd={true}
                      startDate={fromDate ? formatStringToDate(fromDate) : null}
                      endDate={toDate ? formatStringToDate(toDate) : null}
                      minDate={fromDate ? formatStringToDate(fromDate) : null}
                      position="right"
                      dateFormat={DATE_FORMAT_DISPLAY}
                      onChange={this.onChangeEndDate}
                      showMonthDropdown={true}
                      showYearDropdown={true}
                      dropdownMode="select"
                    />
                  ) : (
                    formatDateToDisplay(toDate) || '--'
                  )}
                </div>
              </div>
            </>
          )}

          {!isDerivatives && values.orderPrice && !isOrderType ? (
            <div className={styles.TableRow}>
              <div className={styles.TableCell}>{t('Trading Value')}</div>
              <div className={styles.TableCell}>
                {formatNumber(values.orderPrice * values.orderQuantity, 2) || 0}
              </div>
            </div>
          ) : null}
        </div>
      </Form>
    );
  }

  private onQuantityChange = (value?: number) => {
    this.props.setFieldValue('orderQuantity', value);
    this.props.setFieldTouched('orderQuantity', true);
  };

  private onPriceChange = (value?: number) => {
    this.props.setFieldValue('orderPrice', value);
    this.props.setFieldTouched('orderPrice', true);
  };

  private onChangeStopPrice = (value?: number) => {
    this.props.setFieldValue('stopPrice', value);
    this.props.setFieldTouched('stopPrice', true);
  };

  private onChangeFromDate = (date: Date) => {
    const values = this.props.values as IStopOrderHistoryResponse;
    const stringDate = formatDateToString(date);
    if (
      values.toDate != null &&
      values.fromDate != null &&
      formatStringToDate(values.toDate).getTime() < date.getTime()
    ) {
      this.props.setFieldValue('fromDate', stringDate);
      this.props.setFieldValue('toDate', stringDate);
    } else {
      this.props.setFieldValue('fromDate', stringDate);
    }
  };

  private onChangeEndDate = (date: Date) => {
    this.props.setFieldValue('toDate', formatDateToString(date));
  };

  private onBlurOrderPrice = () => {
    this.queryOrderStockInfo(true);
  };
  private onBlurQuantity = (val: number) => {
    const maxQty =
      this.props.orderStockInfoModal.data?.maxQty != null &&
      this.props.initialValues != null
        ? this.props.orderStockInfoModal.data.maxQty +
          this.props.initialValues.orderQuantity
        : undefined;

    if (
      maxQty != null &&
      val > maxQty &&
      this.props.orderKind !== OrderKind.STOP_LIMIT_ORDER &&
      this.props.initialValues.orderType !== OrderType.ODDLOT
    ) {
      this.props.setFieldValue('orderQuantity', maxQty);
    }
  };

  private queryOrderStockInfo = (onlyGetMaxQty?: boolean) => {
    if (this.props.orderKind === OrderKind.STOP_LIMIT_ORDER) {
      return;
    }

    const { values, selectedAccount, symbolList } = this.props;
    const symbolCode =
      (values as IOrderBookReducer).symbol ||
      (values as IStopOrderHistoryResponse).code;
    if (
      symbolList.map?.[symbolCode]?.m != null &&
      symbolList.map[symbolCode].ce != null &&
      selectedAccount != null
    ) {
      this.props.queryOrderStockInfo({
        accountNumber: selectedAccount.accountNumber,
        accountType: selectedAccount.accountType,
        market: symbolList.map?.[symbolCode].m as Market,
        price: values.orderPrice ?? symbolList.map?.[symbolCode].ce,
        sellBuyType: values.sellBuyType,
        symbolCode,
        onlyGetMaxQty,
        isModal: true,
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  orderStockInfoModal: state.orderStockInfoModal,
  selectedAccount: state.selectedAccount,
  symbolList: state.symbolList,
});

const mapDispatchToProps = {
  queryOrderStockInfo,
  setCurrentSymbol,
};

const ModifyOrderForm = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(ModifyOrderFormComponent)
  ),
  Fallback,
  handleError
);

export default ModifyOrderForm;
