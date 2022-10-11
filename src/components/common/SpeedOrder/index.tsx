import * as React from 'react';
import * as _ from 'lodash';
import * as styles from './styles.scss';
import { AccountRoutes, Routes } from 'constants/routes';
import {
  AccountType,
  Lang,
  LocationBisAskUI,
  Market,
  OrderKind,
  OrderType,
  RealtimeChannelDataType,
  SellBuyType,
  SpeedOrderClickType,
  StopOrderType,
  SymbolType,
  SystemType,
} from 'constants/enum';
import { AutoSizer, List, ListRowProps, Size } from 'react-virtualized';
import { Big } from 'big.js';
import { INewSymbolData } from 'interfaces/market';
import { ISpeedOrderRowData, PromptMode } from './utils';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString } from 'utils/datetime';
import { formatNumber, handleError } from 'utils/common';
import {
  getSpeedOrderPriceList,
  onSingleClickSpeedOrderTrigger,
  onWithPromptSpeedOrderTrigger,
  speedOrderCancelOrder,
  speedOrderCancelStopOrder,
  speedOrderModifyOrder,
  speedOrderModifyStopOrder,
} from './actions';
import { isSymbolTypeValid, roundLot } from 'utils/market';
import {
  placeDerivativesOrder,
  placeOrder,
  placeStopOrder,
  queryOrderStockInfo,
} from '../OrderForm/actions';
import { queryEquityConfirmDebt } from 'components/areas/Account/LoadDetail/ConfirmDebt/action';
import {
  setCurrentSymbol,
  showNotification,
  subscribe,
  subscribeOrderMatch,
  unsubscribe,
  unsubscribeOrderMatch,
} from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import AccountDropdown from '../AccountDropdown';
import BlockUI from '../BlockUI';
import DataRow from './DataRow';
import Fallback from '../Fallback';
import Modal from '../Modal';
import OtpModal from '../OtpModal';
import QuantityInput from '../QuantityInput';
import Spinner from '../Spinner';
import SummaryRow from './SummaryRow';
import SymbolSearch from '../SymbolSearch';
import ToggleSwitch from '../ToggleSwitch';
import classNames from 'classnames';

interface ISpeedOrderProps
  extends React.ClassAttributes<SpeedOrderComponent>,
    WithNamespaces {
  readonly currentSymbol: IState['currentSymbol'];
  readonly currentSymbolData: IState['currentSymbolData'];
  readonly lang: IState['lang'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly symbolList: IState['symbolList'];
  readonly orderStockInfo: IState['orderStockInfo'];
  readonly otpToken: IState['otpToken'];
  readonly placeOrderResult: IState['placeOrderResult'];
  readonly modifyOrderResult: IState['modifyOrderResult'];
  readonly cancelOrderResult: IState['cancelOrderResult'];
  readonly speedOrder: IState['speedOrder'];
  readonly modifySpeedOrderResult: IState['modifySpeedOrderResult'];
  readonly cancelSpeedOrderResult: IState['cancelSpeedOrderResult'];
  readonly isSingleClickSpeedOrder: IState['isSingleClickSpeedOrder'];
  readonly settingsNav: IState['settingsNav'];
  readonly sideBarFunction: IState['sideBarFunction'];
  readonly equityConfirmDebt: IState['equityConfirmDebt'];

  readonly showNotification: typeof showNotification;
  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly getSpeedOrderPriceList: typeof getSpeedOrderPriceList;
  readonly queryOrderStockInfo: typeof queryOrderStockInfo;
  readonly placeOrder: typeof placeOrder;
  readonly placeStopOrder: typeof placeStopOrder;
  readonly placeDerivativesOrder: typeof placeDerivativesOrder;
  readonly speedOrderModifyOrder: typeof speedOrderModifyOrder;
  readonly speedOrderCancelOrder: typeof speedOrderCancelOrder;
  readonly speedOrderModifyStopOrder: typeof speedOrderModifyStopOrder;
  readonly speedOrderCancelStopOrder: typeof speedOrderCancelStopOrder;
  readonly subscribeOrderMatch: typeof subscribeOrderMatch;
  readonly unsubscribeOrderMatch: typeof unsubscribeOrderMatch;
  readonly onSingleClickSpeedOrderTrigger: typeof onSingleClickSpeedOrderTrigger;
  readonly onWithPromptSpeedOrderTrigger: typeof onWithPromptSpeedOrderTrigger;
  readonly queryEquityConfirmDebt: typeof queryEquityConfirmDebt;
}

interface ISpeedOrderState {
  readonly errorQuantity?: boolean;
  readonly errorQuantityContent?: string;
  readonly placeOrderQuantity?: number;
  readonly showModalConfirm?: boolean;
  readonly promptMode?: PromptMode;
  readonly orderKind?: OrderKind;
  readonly sellBuyType: SellBuyType;
  readonly orderQuantity?: number;
  readonly orderPrice?: number;
  readonly oldOrderPrice?: number;
  readonly currentRowData?: ISpeedOrderRowData;
  readonly isConfirmDebt?: boolean;
  /**
   *  Trigger this will disable auto align middle current price
   */
  readonly isFreeScroll?: boolean;
}

class SpeedOrderComponent extends React.Component<
  ISpeedOrderProps,
  ISpeedOrderState
> {
  private virtualListRef: React.RefObject<List>;
  private containerRef: React.RefObject<HTMLDivElement>;
  private localListRange: { start: number; stop: number; current: number } = {
    start: 0,
    stop: 0,
    current: -1,
  };
  private localTimeoutHandle: NodeJS.Timeout;
  constructor(props: ISpeedOrderProps) {
    super(props);

    this.state = {
      placeOrderQuantity: roundLot(
        1,
        props.currentSymbol.infoData?.m,
        props.currentSymbol.symbolType,
        undefined,
        true
      ),
      sellBuyType: SellBuyType.BUY,
    };

    this.virtualListRef = React.createRef();
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const symbol = this.props.symbolList.map?.[this.props.currentSymbol.code];
    if (symbol != null) {
      this.props.subscribe({
        symbolList: [symbol],
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });
    }

    if (this.props.selectedAccount?.accountType === AccountType.MARGIN) {
      this.queryConfirmDebt();
    }

    this.queryOrderStockInfo();
    this.props.getSpeedOrderPriceList();
    this.props.subscribeOrderMatch();
  }

  componentDidUpdate(prevProps: ISpeedOrderProps, prevState: ISpeedOrderState) {
    if (
      this.props.selectedAccount !== prevProps.selectedAccount &&
      this.props.selectedAccount?.accountType === AccountType.MARGIN
    ) {
      this.queryConfirmDebt();
    }

    if (
      this.props.equityConfirmDebt !== prevProps.equityConfirmDebt &&
      this.props.equityConfirmDebt.data?.callAPi ===
        'First_Time_Signed_Equal_False' &&
      _.isEmpty(this.props.equityConfirmDebt.data.resConfirmDebt)
    ) {
      this.queryConfirmDebt(true);
    }

    if (this.props.speedOrder !== prevProps.speedOrder) {
      const { speedOrder, currentSymbol } = this.props;
      if (
        !this.state.isFreeScroll &&
        speedOrder.data.symbolData?.s === currentSymbol.code &&
        speedOrder.data.symbolData.c != null
      ) {
        const priceList = speedOrder.data.priceList.slice(
          1,
          speedOrder.data.priceList.length - 1
        );
        const lastPrice =
          speedOrder.data.symbolData?.c || speedOrder.data.symbolData?.re;
        const currentRowIndex = priceList.findIndex(
          (item) =>
            lastPrice != null &&
            item.price != null &&
            Big(item.price).cmp(Big(lastPrice)) === 0
        );
        this.virtualListRef.current?.scrollToRow(currentRowIndex);
        this.localListRange.current = currentRowIndex;
      } else {
        this.virtualListRef.current?.forceUpdateGrid();
      }
    }
    if (
      this.props.sideBarFunction !== prevProps.sideBarFunction &&
      this.props.sideBarFunction.orderForm != null &&
      this.props.selectedAccount != null
    ) {
      this.props.setCurrentSymbol({
        code: this.props.sideBarFunction.orderForm.stockCode,
      });
    }
    if (
      this.props.currentSymbolData !== prevProps.currentSymbolData &&
      this.props.currentSymbolData?.s !== prevProps.currentSymbolData?.s
    ) {
      this.setState(
        {
          placeOrderQuantity: roundLot(
            1,
            this.props.currentSymbolData?.m,
            this.props.currentSymbolData?.t,
            undefined,
            true
          ),
          isFreeScroll: false,
        },
        () => {
          this.localListRange.current = -1;
          this.virtualListRef.current?.scrollToRow(-1);
          this.virtualListRef.current?.forceUpdateGrid();
          if (this.props.currentSymbolData != null) {
            this.props.subscribe({
              symbolList: [this.props.currentSymbolData],
              types: [
                RealtimeChannelDataType.QUOTE,
                RealtimeChannelDataType.BID_OFFER,
                RealtimeChannelDataType.EXTRA,
              ],
            });
          }

          if (prevProps.currentSymbolData != null) {
            this.props.unsubscribe({
              symbolList: [prevProps.currentSymbolData],
              types: [
                RealtimeChannelDataType.QUOTE,
                RealtimeChannelDataType.BID_OFFER,
                RealtimeChannelDataType.EXTRA,
              ],
            });
          }
        }
      );
      this.queryOrderStockInfo();
    }

    if (
      this.props.currentSymbol !== prevProps.currentSymbol ||
      this.props.selectedAccount !== prevProps.selectedAccount
    ) {
      if (
        isSymbolTypeValid(
          this.props.selectedAccount?.type,
          this.props.currentSymbolData?.t
        )
      ) {
        this.props.getSpeedOrderPriceList();
      }
      this.onCloseModalConfirm();
    }

    if (
      this.props.currentSymbol.code ===
        this.props.speedOrder.data.symbolData?.s &&
      ((this.props.placeOrderResult !== prevProps.placeOrderResult &&
        this.props.placeOrderResult.status.isSucceeded) ||
        (this.props.modifyOrderResult !== prevProps.modifyOrderResult &&
          this.props.modifyOrderResult.status.isSucceeded) ||
        (this.props.cancelOrderResult !== prevProps.cancelOrderResult &&
          this.props.cancelOrderResult.status.isSucceeded) ||
        (this.props.modifySpeedOrderResult !==
          prevProps.modifySpeedOrderResult &&
          this.props.modifySpeedOrderResult.status.isSucceeded) ||
        (this.props.cancelSpeedOrderResult !==
          prevProps.cancelSpeedOrderResult &&
          this.props.cancelSpeedOrderResult.status.isSucceeded))
    ) {
      if (
        isSymbolTypeValid(
          this.props.selectedAccount?.type,
          this.props.currentSymbol.symbolType
        )
      ) {
        this.props.getSpeedOrderPriceList(this.state.orderKind);
      }
      this.onCloseModalConfirm();
    }

    if (this.state.isFreeScroll !== prevState.isFreeScroll) {
      if (this.state.isFreeScroll) {
        this.setTimeoutScroll();
      } else {
        clearTimeout(this.localTimeoutHandle);
      }
    }
  }

  componentWillUnmount() {
    const symbol = this.props.symbolList.map?.[this.props.currentSymbol.code];
    if (symbol != null) {
      this.props.unsubscribe({
        symbolList: [symbol],
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });
    }
    clearTimeout(this.localTimeoutHandle);
    this.props.unsubscribeOrderMatch();
  }

  render() {
    const {
      t,
      settingsNav,
      selectedAccount,
      currentSymbolData,
      speedOrder,
    } = this.props;
    const symbolData: INewSymbolData = {
      s: currentSymbolData?.s ?? '',
      ...speedOrder.data.symbolData,
    };

    const priceList = speedOrder.data.priceList.slice(
      1,
      speedOrder.data.priceList.length - 1
    );

    const firstRowData = speedOrder.data.priceList[0];
    const lastRowData =
      speedOrder.data.priceList[speedOrder.data.priceList.length - 1];

    let currentSymbolDesc = currentSymbolData?.s || '';

    if (currentSymbolData != null) {
      currentSymbolDesc = `${currentSymbolDesc} - ${
        this.props.lang === Lang.VI
          ? currentSymbolData.n1
          : currentSymbolData.n2
      }`;
    }
    return (
      <div className={styles.SpeedOrder} ref={this.containerRef}>
        {currentSymbolData != null &&
          ((selectedAccount?.type !== SystemType.DERIVATIVES &&
            currentSymbolData.t !== SymbolType.ETF &&
            currentSymbolData.t !== SymbolType.FUND &&
            currentSymbolData.t !== SymbolType.STOCK &&
            currentSymbolData.t !== SymbolType.CW) ||
            (selectedAccount?.type === SystemType.DERIVATIVES &&
              currentSymbolData.t !== SymbolType.FUTURES)) && (
            <div className={styles.DisabledSpeedOrder} />
          )}

        <div className={styles.SettingSection}>
          <SymbolSearch
            placeholder={currentSymbolDesc}
            horizontalPosition="right"
            onSymbolSearch={this.onSymbolChange}
            removeIndexStock={true}
          />

          <ToggleSwitch
            checked={this.props.isSingleClickSpeedOrder.isWithPrompt}
            label={'With prompt'}
            onChange={this.onChangePromptStatus}
          />

          <ToggleSwitch
            checked={this.props.isSingleClickSpeedOrder.isOneClick}
            label={'ONE click'}
            onChange={this.onChangeOneClickOrder}
          />
        </div>
        <div className={styles.InputSection}>
          <OverlayTrigger
            key={'Qty'}
            placement="left"
            overlay={
              <Tooltip className={styles.MaxQttTooltip} id={'Qty'}>
                {`${t('Sellable')}: 
                ${formatNumber(
                  this.props.orderStockInfo.data?.maxQty,
                  undefined,
                  undefined,
                  undefined,
                  '—'
                )}`}
              </Tooltip>
            }
          >
            <div className={styles.QuantitySection}>
              {t('Qty')}
              <QuantityInput
                data={symbolData}
                disableQuantityType={true}
                onChange={this.onChangeQuantity}
                value={this.state.placeOrderQuantity}
                quantityType="share"
              />
            </div>
          </OverlayTrigger>
          <div className={styles.AccountSection}>
            <AccountDropdown />
          </div>
        </div>

        <BlockUI
          className={styles.DataSection}
          blocking={this.props.speedOrder.status?.isLoading}
          loader={<Spinner size={50} logo={false} />}
        >
          <div
            className={classNames(styles.Header, {
              [styles.RowReverse]: settingsNav === LocationBisAskUI.ASK_BID,
            })}
          >
            <div>{t('Stop Buy')}</div>
            <div>{t('Buy')}</div>
            <div>{t('Bid Qty')}</div>
            <div>{t('Price')}</div>
            <div>{t('Ask Qty')}</div>
            <div>{t('Sell')}</div>
            <div>{t('Stop Sell')}</div>
          </div>

          <div className={styles.ContentData}>
            <DataRow
              className={classNames(styles.RowTop, {
                [styles.RowReverse]: settingsNav === LocationBisAskUI.ASK_BID,
              })}
              rowData={firstRowData}
              data={symbolData}
              speedOrderContainer={this.containerRef.current || undefined}
              currentRowData={this.state.currentRowData}
              placeOrder={this.onPlaceOrder}
              moveOrder={this.onMoveOrder}
              cancelOrder={this.onCancelOrder}
            />
            <div className={styles.SpeedOrderRowData}>
              <div className={styles.AutoSizerWrapper} onWheel={this.onWheel}>
                <AutoSizer>
                  {({ width, height }: Size) => (
                    <List
                      ref={this.virtualListRef}
                      height={height}
                      width={width}
                      rowCount={priceList.length}
                      rowHeight={26}
                      rowRenderer={this.rowRenderer(symbolData, priceList)}
                      scrollToAlignment="center"
                      onRowsRendered={this.onRowsRendered}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
            <DataRow
              className={classNames(styles.RowBottom, {
                [styles.RowReverse]: settingsNav === LocationBisAskUI.ASK_BID,
              })}
              rowData={lastRowData}
              data={symbolData}
              speedOrderContainer={this.containerRef.current || undefined}
              currentRowData={this.state.currentRowData}
              placeOrder={this.onPlaceOrder}
              moveOrder={this.onMoveOrder}
              cancelOrder={this.onCancelOrder}
            />
            <SummaryRow
              summaryData={speedOrder.data.total}
              speedOrderContainer={this.containerRef.current || undefined}
              cancelAllOrders={this.onCancelAllOrders}
            />
          </div>
        </BlockUI>
        <OtpModal
          className={styles.SpeedOrderModal}
          show={this.state.showModalConfirm}
          onHide={this.onCloseModalConfirm}
          onSubmit={this.confirmPrompt}
        >
          {this.props.isSingleClickSpeedOrder.isWithPrompt ? (
            <div className={styles.ConfirmTable}>
              <div className={styles.Title}>{t(this.getTitleModal())}</div>
              <table>
                <colgroup>
                  <col span={1} style={{ width: '50%' }} />
                  <col span={1} style={{ width: '50%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td>{t('Symbol Code')}</td>
                    <td>{symbolData.s}</td>
                  </tr>
                  <tr>
                    <td>{t('Quantity')}</td>
                    <td>
                      {formatNumber(
                        this.state.promptMode === PromptMode.PLACE
                          ? this.state.placeOrderQuantity
                          : this.state.orderQuantity,
                        2
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Sell/Buy')}</td>
                    <td>{this.state.sellBuyType}</td>
                  </tr>
                  {this.state.oldOrderPrice != null && (
                    <tr>
                      <td>
                        {t(
                          this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
                            ? 'Old Stop Price'
                            : 'Old Price'
                        )}
                      </td>
                      <td>{formatNumber(this.state.oldOrderPrice, 2)}</td>
                    </tr>
                  )}
                  {this.state.orderPrice != null && (
                    <tr>
                      <td>
                        {t(
                          this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
                            ? 'Stop Price'
                            : 'Price'
                        )}
                      </td>
                      <td>{formatNumber(this.state.orderPrice, 2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </OtpModal>

        {/* Confirm Debt */}
        <Modal
          className={styles.ConfirmDebtModal}
          // dialogClassName={classNames(styles.OtpOnceModalDialog)}
          show={this.state.isConfirmDebt}
          onHide={this.onCloseModalConfirmDebt}
          size={'sm'}
        >
          <div className={styles.Title}>{t('Confirm debt')}</div>
          <span>{t('Please confirm your debt to continue')}</span>
          <div className={styles.Buttons}>
            <Link
              to={`/${Routes.ACCOUNT}/${AccountRoutes.LOAN_DETAIL}`}
              className={styles.SubmitButton}
              onClick={this.onCloseModalConfirmDebt}
            >
              {t('Go to confirm debt')}
            </Link>
            <button
              className={styles.CancelButton}
              onClick={this.onCloseModalConfirmDebt}
            >
              {t('Cancel')}
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  private onCloseModalConfirmDebt = () => {
    this.setState({ isConfirmDebt: false });
  };

  private queryConfirmDebt = (signed?: boolean) => {
    if (this.props.selectedAccount?.account) {
      this.props.queryEquityConfirmDebt({
        accountNumber: this.props.selectedAccount?.account,
        historyBy: 0,
        signed: signed ?? false,
      });
    }
  };

  private onPlaceOrder = (
    orderKind: OrderKind,
    sellBuyType: SellBuyType,
    rowData: ISpeedOrderRowData,
    clickType: SpeedOrderClickType
  ) => () => {
    const isConfirmDebt =
      _.isEmpty(this.props.equityConfirmDebt.data?.resConfirmDebt) ||
      this.props.equityConfirmDebt.data?.resConfirmDebt.status;
    if (
      !isConfirmDebt &&
      this.props.selectedAccount?.accountType === AccountType.MARGIN &&
      sellBuyType === SellBuyType.BUY
    ) {
      this.setState({ isConfirmDebt: true });
    } else {
      const speedOrderClickType = this.props.isSingleClickSpeedOrder
        ? SpeedOrderClickType.SINGLE_CLICK
        : SpeedOrderClickType.DOUBLE_CLICK;
      if (clickType === speedOrderClickType) {
        if (this.props.isSingleClickSpeedOrder.isWithPrompt) {
          this.setState({
            promptMode: PromptMode.PLACE,
            showModalConfirm: true,
            orderPrice: rowData.price,
            currentRowData: rowData,
            orderKind,
            sellBuyType,
          });
        } else {
          if (this.props.otpToken != null) {
            this.setState(
              {
                promptMode: PromptMode.PLACE,
                orderPrice: rowData.price,
                currentRowData: rowData,
                orderKind,
                sellBuyType,
              },
              () => {
                this.confirmPrompt();
              }
            );
          } else {
            this.setState({
              promptMode: PromptMode.PLACE,
              showModalConfirm: true,
              orderPrice: rowData.price,
              currentRowData: rowData,
              orderKind,
              sellBuyType,
            });
          }
        }
      }
    }
  };

  private onMoveOrder = (rowData: ISpeedOrderRowData, newPrice: number) => {
    const orderQuantity =
      rowData.orderKind === OrderKind.STOP_LIMIT_ORDER
        ? rowData.stopPriceData?.[rowData.sellBuyType || SellBuyType.BUY]
            .orderQuantity
        : rowData.priceData?.[rowData.sellBuyType || SellBuyType.BUY]
            .unmatchedQuantity;
    if (this.props.isSingleClickSpeedOrder.isWithPrompt) {
      this.setState({
        promptMode: PromptMode.MOVE,
        showModalConfirm: true,
        orderPrice: newPrice,
        oldOrderPrice: rowData.price,
        orderQuantity,
        sellBuyType: rowData.sellBuyType || SellBuyType.BUY,
        orderKind: rowData.orderKind,
        currentRowData: rowData,
      });
    } else {
      if (this.props.otpToken != null) {
        this.setState(
          {
            promptMode: PromptMode.MOVE,
            orderPrice: newPrice,
            oldOrderPrice: rowData.price,
            orderQuantity,
            sellBuyType: rowData.sellBuyType || SellBuyType.BUY,
            orderKind: rowData.orderKind,
            currentRowData: rowData,
          },
          () => {
            this.confirmPrompt();
          }
        );
      } else {
        this.setState({
          promptMode: PromptMode.MOVE,
          showModalConfirm: true,
          orderPrice: newPrice,
          oldOrderPrice: rowData.price,
          orderQuantity,
          sellBuyType: rowData.sellBuyType || SellBuyType.BUY,
          orderKind: rowData.orderKind,
          currentRowData: rowData,
        });
      }
    }
  };

  private onCancelOrder = (rowData: ISpeedOrderRowData) => {
    const orderQuantity =
      rowData.orderKind === OrderKind.STOP_LIMIT_ORDER
        ? rowData.stopPriceData?.[rowData.sellBuyType || SellBuyType.BUY]
            .orderQuantity
        : rowData.priceData?.[rowData.sellBuyType || SellBuyType.BUY]
            .unmatchedQuantity;
    if (this.props.isSingleClickSpeedOrder.isWithPrompt) {
      this.setState({
        promptMode: PromptMode.CANCEL,
        showModalConfirm: true,
        orderPrice: rowData.price,
        orderQuantity,
        sellBuyType: rowData.sellBuyType || SellBuyType.BUY,
        orderKind: rowData.orderKind,
        currentRowData: rowData,
      });
    } else {
      if (this.props.otpToken != null) {
        this.setState(
          {
            promptMode: PromptMode.CANCEL,
            orderPrice: rowData.price,
            orderQuantity,
            sellBuyType: rowData.sellBuyType || SellBuyType.BUY,
            orderKind: rowData.orderKind,
            currentRowData: rowData,
          },
          () => {
            this.confirmPrompt();
          }
        );
      } else {
        this.setState({
          promptMode: PromptMode.CANCEL,
          showModalConfirm: true,
          orderPrice: rowData.price,
          orderQuantity,
          sellBuyType: rowData.sellBuyType || SellBuyType.BUY,
          orderKind: rowData.orderKind,
          currentRowData: rowData,
        });
      }
    }
  };

  private onCancelAllOrders = (
    orderKind: OrderKind,
    sellBuyType: SellBuyType,
    orderQuantity?: number
  ) => {
    if (this.props.isSingleClickSpeedOrder.isWithPrompt) {
      this.setState({
        promptMode: PromptMode.CANCEL_ALL,
        showModalConfirm: true,
        orderPrice: undefined,
        oldOrderPrice: undefined,
        orderQuantity,
        orderKind,
        sellBuyType,
      });
    } else {
      if (this.props.otpToken != null) {
        this.setState(
          {
            promptMode: PromptMode.CANCEL_ALL,
            orderPrice: undefined,
            oldOrderPrice: undefined,
            orderQuantity,
            orderKind,
            sellBuyType,
          },
          () => {
            this.confirmPrompt();
          }
        );
      } else {
        this.setState({
          promptMode: PromptMode.CANCEL_ALL,
          showModalConfirm: true,
          orderPrice: undefined,
          oldOrderPrice: undefined,
          orderQuantity,
          orderKind,
          sellBuyType,
        });
      }
    }
  };

  private onChangePromptStatus = (checked: boolean) => {
    this.props.onWithPromptSpeedOrderTrigger();
  };

  private onChangeOneClickOrder = () => {
    this.props.onSingleClickSpeedOrderTrigger();
  };

  private onChangeQuantity = (value?: number) => {
    this.setState({ placeOrderQuantity: value });
  };

  private callPlaceOrder = () => {
    if (this.props.selectedAccount == null) {
      return;
    }

    if (this.state.orderKind === OrderKind.STOP_LIMIT_ORDER) {
      this.props.placeStopOrder({
        accountNumber: this.props.selectedAccount.accountNumber,
        code: this.props.currentSymbol.code,
        orderQuantity: this.state.placeOrderQuantity || 0,
        sellBuyType: this.state.sellBuyType,
        orderType: StopOrderType.STOP,
        fromDate: formatDateToString(new Date()) || '',
        toDate: formatDateToString(new Date()) || '',
        stopPrice: this.state.orderPrice || 0,
      });
    } else {
      if (this.props.currentSymbol.symbolType === SymbolType.FUTURES) {
        this.props.placeDerivativesOrder(
          {
            accountNumber: this.props.selectedAccount.accountNumber,
            code: this.props.currentSymbol.code,
            orderPrice: this.state.orderPrice || 0,
            orderQuantity: this.state.placeOrderQuantity || 0,
            orderType: OrderType.LO,
            sellBuyType: this.state.sellBuyType,
          },
          OrderKind.NORMAL_ORDER
        );
      } else {
        this.props.placeOrder(
          {
            accountNumber: this.props.selectedAccount.accountNumber,
            code: this.props.currentSymbol.code,
            marketType: this.props.currentSymbol.infoData?.m || Market.HOSE,
            orderPrice: this.state.orderPrice || 0,
            orderQuantity: this.state.placeOrderQuantity || 0,
            orderType: OrderType.LO,
            sellBuyType: this.state.sellBuyType,
          },
          OrderKind.NORMAL_ORDER
        );
      }
    }
    this.setState({ showModalConfirm: false });
  };

  private callCancelOrder = () => {
    if (this.props.selectedAccount == null) {
      return;
    }

    if (this.state.orderKind === OrderKind.STOP_LIMIT_ORDER) {
      this.props.speedOrderCancelStopOrder({
        accountNumber: this.props.selectedAccount.accountNumber,
        code: this.props.currentSymbol.code,
        sellBuyType: this.state.sellBuyType,
        stopPrice: this.state.orderPrice,
      });
    } else {
      this.props.speedOrderCancelOrder({
        accountNumber: this.props.selectedAccount.accountNumber,
        accountType: this.props.selectedAccount.type,
        sellBuyType: this.state.sellBuyType,
        stockCode: this.props.currentSymbol.code,
        orderPrice: this.state.orderPrice,
      });
    }
  };

  private callCancelAllOrders = () => {
    if (this.props.selectedAccount == null) {
      return;
    }

    if (this.state.orderKind === OrderKind.STOP_LIMIT_ORDER) {
      this.props.speedOrderCancelStopOrder({
        accountNumber: this.props.selectedAccount.accountNumber,
        code: this.props.currentSymbol.code,
        sellBuyType: this.state.sellBuyType,
      });
    } else {
      this.props.speedOrderCancelOrder({
        accountNumber: this.props.selectedAccount.accountNumber,
        accountType: this.props.selectedAccount.type,
        sellBuyType: this.state.sellBuyType,
        stockCode: this.props.currentSymbol.code,
      });
    }
  };

  private callMoveOrder = () => {
    if (this.props.selectedAccount == null) {
      return;
    }

    if (this.state.orderKind === OrderKind.STOP_LIMIT_ORDER) {
      this.props.speedOrderModifyStopOrder({
        accountNumber: this.props.selectedAccount.accountNumber,
        code: this.props.currentSymbol.code,
        sellBuyType: this.state.sellBuyType,
        stopPrice: this.state.oldOrderPrice || 0,
        newStopPrice: this.state.orderPrice || 0,
      });
    } else {
      this.props.speedOrderModifyOrder({
        accountNumber: this.props.selectedAccount.accountNumber,
        accountType: this.props.selectedAccount.type,
        sellBuyType: this.state.sellBuyType,
        stockCode: this.props.currentSymbol.code,
        newOrderPrice: this.state.orderPrice || 0,
        orderPrice: this.state.oldOrderPrice || 0,
        market:
          this.props.symbolList.map?.[this.props.currentSymbol.code].m ||
          Market.HOSE,
      });
    }
  };

  private confirmPrompt = () => {
    switch (this.state.promptMode) {
      case PromptMode.PLACE:
        this.callPlaceOrder();
        break;
      case PromptMode.MOVE:
        this.callMoveOrder();
        break;
      case PromptMode.CANCEL:
        this.callCancelOrder();
        break;
      case PromptMode.CANCEL_ALL:
        this.callCancelAllOrders();
      default:
        break;
    }
  };

  private onCloseModalConfirm = () => {
    this.setState({
      showModalConfirm: false,
      promptMode: undefined,
      oldOrderPrice: undefined,
      currentRowData: undefined,
      orderKind: undefined,
    });
  };

  private onSymbolChange = (code: string | null) => {
    if (code != null) {
      this.props.setCurrentSymbol({ code });
    }
  };

  private onRowsRendered = (info: {
    overscanStartIndex: number;
    overscanStopIndex: number;
    startIndex: number;
    stopIndex: number;
  }) => {
    this.localListRange.start = info.startIndex;
    this.localListRange.stop = info.stopIndex;
  };

  private onWheel = () => {
    if (this.state.isFreeScroll) {
      this.setTimeoutScroll();
    } else {
      this.setState({ isFreeScroll: true });
    }
  };

  private rowRenderer = (
    symbolData: INewSymbolData,
    priceList: ISpeedOrderRowData[]
  ) => {
    return (props: ListRowProps) => {
      const rowData = priceList[props.index];
      return (
        <div key={props.key} style={props.style}>
          <DataRow
            className={classNames(styles.Row, {
              [styles.RowReverse]:
                this.props.settingsNav === LocationBisAskUI.ASK_BID,
            })}
            rowData={rowData}
            data={symbolData}
            speedOrderContainer={this.containerRef.current || undefined}
            currentRowData={this.state.currentRowData}
            placeOrder={this.onPlaceOrder}
            moveOrder={this.onMoveOrder}
            cancelOrder={this.onCancelOrder}
          />
        </div>
      );
    };
  };

  private getTitleModal = () => {
    let title = '';
    if (this.state.promptMode === PromptMode.PLACE) {
      title =
        this.state.sellBuyType === SellBuyType.SELL
          ? this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
            ? 'Place stop order sell'
            : 'Place order sell'
          : this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
          ? 'Place stop order buy'
          : 'Place order buy';
    } else if (this.state.promptMode === PromptMode.MOVE) {
      title =
        this.state.sellBuyType === SellBuyType.SELL
          ? this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
            ? 'Move sell stop order'
            : 'Move sell order'
          : this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
          ? 'Move buy stop order'
          : 'Move buy order';
    } else if (this.state.promptMode === PromptMode.CANCEL) {
      title =
        this.state.sellBuyType === SellBuyType.SELL
          ? this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
            ? 'Cancel sell stop order'
            : 'Cancel sell order'
          : this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
          ? 'Cancel buy stop order'
          : 'Cancel buy order';
    } else if (this.state.promptMode === PromptMode.CANCEL_ALL) {
      title =
        this.state.sellBuyType === SellBuyType.SELL
          ? this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
            ? 'Cancel all sell stop order'
            : 'Cancel all sell order'
          : this.state.orderKind === OrderKind.STOP_LIMIT_ORDER
          ? 'Cancel buy all stop order'
          : 'Cancel buy all order';
    }

    return title;
  };

  private setTimeoutScroll = () => {
    clearTimeout(this.localTimeoutHandle);
    this.localTimeoutHandle = setTimeout(() => {
      this.setState({ isFreeScroll: false });
    }, 10000);
  };

  private queryOrderStockInfo = () => {
    const { currentSymbolData, selectedAccount } = this.props;
    if (
      selectedAccount &&
      currentSymbolData &&
      currentSymbolData.m &&
      currentSymbolData.re
    ) {
      this.props.queryOrderStockInfo({
        accountNumber: selectedAccount.accountNumber,
        accountType: selectedAccount.accountType,
        market: currentSymbolData.m,
        price:
          currentSymbolData.re ?? currentSymbolData.c ?? currentSymbolData.pc,
        sellBuyType: SellBuyType.SELL,
        symbolCode: currentSymbolData.s,
        onlyGetMaxQty: true,
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  currentSymbol: state.currentSymbol,
  currentSymbolData: state.currentSymbolData,
  lang: state.lang,
  selectedAccount: state.selectedAccount,
  symbolList: state.symbolList,
  orderStockInfo: state.orderStockInfo,
  otpToken: state.otpToken,
  placeOrderResult: state.placeOrderResult,
  modifyOrderResult: state.modifyOrderResult,
  cancelOrderResult: state.cancelOrderResult,
  speedOrder: state.speedOrder,
  modifySpeedOrderResult: state.modifySpeedOrderResult,
  cancelSpeedOrderResult: state.cancelSpeedOrderResult,
  isSingleClickSpeedOrder: state.isSingleClickSpeedOrder,
  settingsNav: state.settingsNav,
  sideBarFunction: state.sideBarFunction,
  equityConfirmDebt: state.equityConfirmDebt,
});

const mapDispatchToProps = {
  showNotification,
  subscribe,
  unsubscribe,
  setCurrentSymbol,
  getSpeedOrderPriceList,
  queryOrderStockInfo,
  placeOrder,
  placeStopOrder,
  placeDerivativesOrder,
  speedOrderModifyOrder,
  speedOrderCancelOrder,
  speedOrderModifyStopOrder,
  speedOrderCancelStopOrder,
  subscribeOrderMatch,
  unsubscribeOrderMatch,
  onSingleClickSpeedOrderTrigger,
  onWithPromptSpeedOrderTrigger,
  queryEquityConfirmDebt,
};

const SpeedOrder = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(SpeedOrderComponent)
  ),
  Fallback,
  handleError
);

export default SpeedOrder;
