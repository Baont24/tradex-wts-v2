import * as React from 'react';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import * as dateFns from 'date-fns';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import * as utils from './utils';
import { AccountDropdown, Dropdown, Fallback } from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import {
  AccountType,
  Lang,
  Market,
  OrderFormViewMode,
  OrderKind,
  OrderType,
  SellBuyType,
  SystemType,
} from 'constants/enum';
import { Big } from 'big.js';
import { Col, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { DATE_FORMAT_DISPLAY } from 'constants/main';
import {
  DERIVATIVES_CONDITIONAL_TYPE,
  DerivativesConditionalType,
  IOrderForm,
  IOrderFormConfig,
  OrderFormFieldKey,
} from './config';
import { FaCaretDown } from 'react-icons/fa';
import { Form } from 'formik';
import { IAccount, IFormProps } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { QuestionMarkSVG, SettingSVG } from 'assets/svg';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeOrderFormHeight, queryOrderStockInfo } from './actions';
import { connect } from 'react-redux';
import { debounce } from 'utils/delay';
import {
  formatDateToDisplay,
  formatDateToString,
  formatStringToDate,
} from 'utils/datetime';
import { formatNumber, handleError } from 'utils/common';
import { getAssetInforDerivatives } from 'components/areas/Account/AssetInformation/AssetInforDerivatives/actions';
import { getAssetInformation } from 'components/areas/Account/AssetInformation/AssetInforEquity/actions';
import { getMinLot, roundLot, roundStep } from 'utils/market';
import { openOtpModal } from 'redux/global-actions';
import { queryEquityConfirmDebt } from 'components/areas/Account/LoadDetail/ConfirmDebt/action';
import { withErrorBoundary } from 'react-error-boundary';
import CheckBox from '../CheckBox';
import CurrentPriceField from './CurrentPriceField';
import DatePicker from '../DatePicker';
import DateRangePicker from '../DateRangePicker';
import Modal from '../Modal';
import NumericInput from '../NumericInput';
import OtpModal from '../OtpModal';
import PositionField from './PositionField';
import PriceInput from '../PriceInput';
import QuantityInput from '../QuantityInput';
import ScrollBar from '../ScrollBar';
import SymbolSearch from '../SymbolSearch';
import ToggleSwitch from '../ToggleSwitch';
import configEnv from 'config';

interface IOrderFormProps
  extends React.ClassAttributes<OrderFormComponent>,
    WithNamespaces,
    IFormProps<IOrderForm> {
  readonly currentSymbol: IState['currentSymbol'];
  readonly currentSymbolData: IState['currentSymbolData'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly lang: IState['lang'];
  readonly orderStockInfo: IState['orderStockInfo'];
  readonly otpToken: IState['otpToken'];
  readonly symbolList: IState['symbolList'];
  readonly placeOrderResult: IState['placeOrderResult'];
  readonly config: IOrderFormConfig;
  readonly disabled?: boolean;
  readonly orderKind: OrderKind;
  readonly viewMode?: OrderFormViewMode;
  readonly configHyperLink: IState['config'];
  readonly assetInformation: IState['assetInformation'];
  readonly assetInforDerivatives: IState['assetInforDerivatives'];
  readonly equityConfirmDebt: IState['equityConfirmDebt'];

  readonly onSymbolSearch?: (code: string | null) => void;
  readonly openOtpModal: typeof openOtpModal;
  readonly queryOrderStockInfo: typeof queryOrderStockInfo;
  readonly getAssetInformation: typeof getAssetInformation;
  readonly changeOrderFormHeight: typeof changeOrderFormHeight;
  readonly getAssetInforDerivatives: typeof getAssetInforDerivatives;
  readonly queryEquityConfirmDebt: typeof queryEquityConfirmDebt;
}

interface IOrderFormStates {
  readonly isTableMarginOpen?: boolean;
  readonly isTableCashOpen?: boolean;
  readonly isConfirmDebt?: boolean;
}

class OrderFormComponent extends React.Component<
  IOrderFormProps,
  IOrderFormStates
> {
  private containerRef: React.RefObject<HTMLDivElement>;

  constructor(props: IOrderFormProps) {
    super(props);

    this.state = {};

    this.containerRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.selectedAccount != null) {
      if (this.props.selectedAccount.isDerivatives) {
        this.props.getAssetInforDerivatives({
          accountNo: this.props.selectedAccount.accountNumber,
        });
      } else {
        this.props.getAssetInformation({
          accountNumber: this.props.selectedAccount.accountNumber,
        });
      }
    }
    if (this.props.selectedAccount?.accountType === AccountType.MARGIN) {
      this.queryConfirmDebt();
    }
  }

  componentDidUpdate(prevProps: IOrderFormProps) {
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
    if (
      prevProps.selectedAccount !== this.props.selectedAccount &&
      this.props.selectedAccount != null
    ) {
      if (this.props.selectedAccount.isDerivatives) {
        this.props.getAssetInforDerivatives({
          accountNo: this.props.selectedAccount.accountNumber,
        });
      } else {
        this.props.getAssetInformation({
          accountNumber: this.props.selectedAccount.accountNumber,
        });
      }
      if (this.props.selectedAccount?.type === SystemType.DERIVATIVES) {
        this.props.changeOrderFormHeight({
          height: this.state.isTableCashOpen ? 320 : 240,
        });
      } else if (this.state.isTableCashOpen) {
        this.props.changeOrderFormHeight({
          height: !this.state.isTableCashOpen ? 320 : 240,
        });
      }
    }
    if (prevProps.orderStockInfo !== this.props.orderStockInfo) {
      const { values } = this.props;
      const maxQty = this.props.orderStockInfo.data?.maxQty;
      const orderQuantityPercentage = maxQty
        ? +Big(values.orderQuantity).div(maxQty).times(100).toFixed(1)
        : 0;
      const orderQuantity =
        values.orderType === OrderType.ODDLOT
          ? values.orderQuantity
          : roundLot(
              values.orderQuantity,
              values.market,
              values.symbolType,
              undefined,
              true
            );
      const tradingValue =
        values.orderPrice && orderQuantity
          ? +Big(values.orderPrice).times(orderQuantity)
          : 0;
      this.setValues({ maxQty, orderQuantityPercentage, tradingValue });
    }

    if (
      prevProps.selectedAccount !== this.props.selectedAccount ||
      prevProps.values !== this.props.values
    ) {
      this.props.setFieldValue(
        'accountNumber',
        this.props.selectedAccount?.accountNumber
      );
    }

    if (
      (prevProps.placeOrderResult !== this.props.placeOrderResult &&
        this.props.placeOrderResult.status.isSucceeded) ||
      (prevProps.otpToken === null &&
        prevProps.otpToken !== this.props.otpToken)
    ) {
      this.setValues({ isConfirmModalOpened: false });
    }

    if (
      prevProps.currentSymbolData !== this.props.currentSymbolData &&
      this.props.currentSymbolData?.s === this.props.values.stockCode &&
      this.props.currentSymbolData.c !== this.props.values.currentPrice
    ) {
      this.props.setFieldValue('currentPrice', this.props.currentSymbolData.c);
    }

    return true;
  }

  render() {
    const {
      t,
      values,
      config,
      configHyperLink,
      currentSymbol,
      lang,
      errors,
      selectedAccount,
      orderStockInfo,
      symbolList,
      assetInformation,
      assetInforDerivatives,
    } = this.props;
    const regex = /[^/]*/;
    const symbol =
      currentSymbol.code === values.stockCode
        ? currentSymbol.infoData
        : symbolList.map?.[values.stockCode];

    const isDerivatives = selectedAccount?.type === SystemType.DERIVATIVES;
    const isOddlot = values.orderType === OrderType.ODDLOT;
    const purchasingPower = orderStockInfo.data
      ? orderStockInfo.data.PP
      : undefined;
    const marginRatio = orderStockInfo.data
      ? orderStockInfo.data.marginRatio
      : undefined;
    const quantityStep = isDerivatives
      ? 10000
      : values.orderPrice
      ? +Big(values.orderPrice).times(getMinLot(symbol?.m, symbol?.t, isOddlot))
      : 1000;
    const currentSymbolDesc =
      symbol != null ? (
        <span>
          {values.stockCode}
          <span style={{ opacity: 0.5 }}>{` (${values.market} - ${
            lang === Lang.VI ? symbol?.n1 : symbol?.n2
          })`}</span>
        </span>
      ) : (
        values.stockCode
      );
    const isSubmitDisabled =
      !this.props.isValid ||
      this.props.orderStockInfo.status.isLoading ||
      this.props.placeOrderResult.status.isLoading;

    const maxQty =
      values.maxQty && values.maxQty > 500000 ? 500000 : values.maxQty;

    const popover = (
      <Popover
        id={styles.PopoverOrderFormSetting}
        className={globalStyles.Popover}
      >
        <div className={styles.PopoverTitle}>
          {t('Unit Price for HNX/UPCOM/HOSE (except Der)')}
        </div>
        <div className={styles.PopoverContent}>
          <CheckBox label={'x 1'} />
          <CheckBox label={'x 1000'} />
        </div>
      </Popover>
    );

    const assetDer = [
      {
        title: 'Net Asset Value',
        value: formatNumber(
          Number(assetInforDerivatives?.data?.accountSummary.totalEquity),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Total Gain/Loss',
        value: formatNumber(
          Number(assetInforDerivatives?.data?.accountSummary.totalPL),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Unrealized Gain/Loss',
        value: formatNumber(
          Number(assetInforDerivatives?.data?.accountSummary.dailyPL),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Realized Gain/Loss',
        value: formatNumber(
          Number(assetInforDerivatives?.data?.accountSummary.dailyPL),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Commission',
        value: formatNumber(
          Number(
            regex.exec(
              assetInforDerivatives?.data?.accountSummary
                .commission_tax as string
            )
          ),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Tax + VSD Fee',
        value: formatNumber(
          Number(
            assetInforDerivatives?.data?.accountSummary.commission_tax.replace(
              regex.exec(
                assetInforDerivatives?.data?.accountSummary
                  .commission_tax as string
              ) + '/',
              ''
            )
          ),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Margin Requirement',
        value: formatNumber(
          Number(
            assetInforDerivatives?.data?.portfolioAssessment.exchange.marginReq
          ),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Account Ratio',
        value: formatNumber(
          Number(
            Number(
              assetInforDerivatives?.data?.portfolioAssessment.exchange
                .accountRatio
            ) >
              Number(
                assetInforDerivatives?.data?.portfolioAssessment.internal
                  .accountRatio
              )
              ? assetInforDerivatives?.data?.portfolioAssessment.exchange
                  .accountRatio
              : assetInforDerivatives?.data?.portfolioAssessment.internal
                  .accountRatio
          ),
          2,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Margin Call',
        value: formatNumber(
          Number(
            Number(
              assetInforDerivatives?.data?.portfolioAssessment.exchange
                .marginCall
            ) >
              Number(
                assetInforDerivatives?.data?.portfolioAssessment.internal
                  .marginCall
              )
              ? assetInforDerivatives?.data?.portfolioAssessment.exchange
                  .marginCall
              : assetInforDerivatives?.data?.portfolioAssessment.internal
                  .marginCall
          ),
          2,
          undefined,
          false,
          '—'
        ),
      },
    ];
    const assetEquity = [
      {
        title: 'Net Asset Value',
        value: formatNumber(
          Number(assetInformation.data?.accountSummary?.netAssetValue),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Total Stock Market Value',
        value: formatNumber(
          Number(assetInformation.data?.total?.marketValue),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Cash Withdrawal',
        value: formatNumber(
          Number(assetInformation.data?.cashInformation?.cashWithdrawal),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Available advanced cash',
        value: formatNumber(
          Number(assetInformation.data?.cashInformation?.availableAdvancedCash),
          0,
          undefined,
          false,
          '—'
        ),
      },
    ];

    const { data } = this.props.assetInformation;
    const margin = data?.margin;
    const marginCallBy = data?.marginCallBy;

    const equityMargin = [
      {
        title: 'Fixed Loan',
        value: formatNumber(
          Number(margin?.fixedLoan),
          0,
          undefined,
          false,
          '—'
        ),
        hide: false,
      },
      {
        title: 'Day Loan',
        value: formatNumber(Number(margin?.dayLoan), 0, undefined, false, '—'),
        hide: false,
      },
      {
        title: 'Accured Debit Interest',
        value: formatNumber(
          Number(margin?.accuredDebitInterest),
          0,
          undefined,
          false,
          '—'
        ),
        hide: false,
      },
      {
        title: 'Stock main',
        value: formatNumber(
          Number(margin?.stockMain),
          0,
          undefined,
          false,
          '—'
        ),
        hide: false,
      },
      {
        title: 'MAS_Equity',
        value: formatNumber(Number(margin?.equity), 0, undefined, false, '—'),
        hide: false,
      },
      {
        title: 'Margin ratio (%)',
        value: margin?.marginRatio ?? '—',
        hide: false,
      },
      {
        title: 'Maintenance ratio (%)',
        value: margin?.maintenanceRatio ?? '—',
        hide: false,
      },
      {
        title: 'Margin call by stock main amt',
        value: formatNumber(
          marginCallBy?.marginCallByStockMainAmount,
          0,
          undefined,
          false,
          '—'
        ),
        hide: configEnv.hideMarginCall,
      },
      {
        title: 'Margin call by cash',
        value: formatNumber(
          marginCallBy?.marginCallByCash,
          0,
          undefined,
          false,
          '—'
        ),
        hide: configEnv.hideMarginCall,
      },
    ];

    const isStopLimitOrder =
      this.props.orderKind === OrderKind.STOP_LIMIT_ORDER;
    const isConditionalOrder =
      this.props.orderKind === OrderKind.CONDITIONAL_ORDER;
    const isNormalOrder = this.props.orderKind === OrderKind.NORMAL_ORDER;
    return (
      <ScrollBar autoHide={true}>
        <Form
          className={classNames(styles.OrderForm, {
            [styles.HorizontalForm]:
              this.props.viewMode === OrderFormViewMode.HORIZONTAL,
            [styles.NormalOrder]: isNormalOrder,
          })}
        >
          {this.props.disabled && <div className={styles.DisabledSection} />}

          <div
            className={classNames(styles.BuySellSection, styles.FormField)}
            style={config[OrderFormFieldKey.BUY_SELL]?.style}
            ref={this.containerRef}
          >
            <div className={styles.BuySellButton}>
              <div
                className={classNames(styles.BuyButton, {
                  [styles.Active]: values.sellBuyType === SellBuyType.BUY,
                })}
                onClick={this.onChangeBuyType}
              >
                {t('BUY 2')}
              </div>
              <div
                className={classNames(styles.SellButton, {
                  [styles.Active]: values.sellBuyType === SellBuyType.SELL,
                })}
                onClick={this.onChangeSellType}
              >
                {t('SELL 2')}
              </div>
              {this.props.viewMode === OrderFormViewMode.HORIZONTAL && (
                <CurrentPriceField onClickPrice={this.onClickPrice} />
              )}
            </div>

            <div className={styles.SideButton}>
              {false && (
                <OverlayTrigger
                  overlay={popover}
                  placement="bottom"
                  trigger="click"
                  container={this.containerRef}
                  rootClose={true}
                >
                  <div className={styles.SettingButton}>
                    <SettingSVG width={10} />
                  </div>
                </OverlayTrigger>
              )}
              <div className={styles.HelpButton}>
                <a
                  href={
                    configHyperLink.companyInfo[configHyperLink.domain]
                      ?.hyperlink?.userGuide[lang] || '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <QuestionMarkSVG width={10} />
                </a>
              </div>
            </div>
          </div>

          {isNormalOrder &&
            this.props.viewMode !== OrderFormViewMode.HORIZONTAL && (
              <div
                className={classNames(styles.CashInformationVertical, {
                  [styles.TypeNotMargin]:
                    this.props.selectedAccount?.accountType !==
                    AccountType.MARGIN,
                })}
              >
                <Row>
                  <Col lg={4} sm={6} className="mt-3 pr-0">
                    <div
                      className={classNames(
                        styles.TableCashInformationVertical
                      )}
                    >
                      <table>
                        <thead>
                          <tr className={styles.Row}>
                            <th colSpan={2}>{t('Cash Information')}</th>
                            <th>
                              <div
                                className={classNames(styles.FaDown, {
                                  [styles.Active]: this.state.isTableCashOpen,
                                })}
                                onClick={this.clickCash}
                              >
                                <FaCaretDown />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        {this.state.isTableCashOpen && (
                          <tbody>
                            {isDerivatives
                              ? assetDer.map((asset, i) => (
                                  <tr key={i}>
                                    <td>{t(asset.title)}</td>
                                    <td>{asset.value}</td>
                                  </tr>
                                ))
                              : assetEquity.map((asset, i) => (
                                  <tr key={i}>
                                    <td>{t(asset.title)}</td>
                                    <td>{asset.value}</td>
                                  </tr>
                                ))}
                          </tbody>
                        )}
                      </table>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

          {isNormalOrder &&
            this.props.selectedAccount?.accountType === AccountType.MARGIN &&
            this.props.viewMode !== OrderFormViewMode.HORIZONTAL && (
              <div className={styles.MarginInformationVertical}>
                <Row>
                  <Col lg={4} sm={6} className="mt-3 pl-0">
                    <div className={styles.TableMarginInformationVertical}>
                      <table>
                        <thead>
                          <tr className={styles.Row}>
                            <th>{t('Margin Information')}</th>
                            <th>
                              <div
                                className={classNames(styles.FaDown, {
                                  [styles.Active]: this.state.isTableMarginOpen,
                                })}
                                onClick={this.clickMargin}
                              >
                                <FaCaretDown />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        {this.state.isTableMarginOpen && (
                          <tbody>
                            {equityMargin
                              .filter((item) => item.hide === false)
                              .map((item, index) => (
                                <tr key={index}>
                                  <td>{t(item.title)}</td>
                                  <td>
                                    {item.value}
                                    {item.title.indexOf('%') !== -1 && '%'}
                                    {item.title.indexOf('rate') !== -1 && '%'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        )}
                      </table>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

          {config[OrderFormFieldKey.ACCOUNT] != null && (
            <div
              className={classNames(styles.AccountSection, styles.FormField)}
              style={config[OrderFormFieldKey.ACCOUNT]?.style}
            >
              <div className={classNames(styles.MainField)}>
                <div className={styles.FieldTitle}>{t('Account No.')}</div>
                <div
                  className={classNames(styles.FieldInput, {
                    [styles.Vertical]:
                      this.props.viewMode !== OrderFormViewMode.HORIZONTAL,
                  })}
                >
                  <AccountDropdown
                    isForm={true}
                    onChange={this.onChangeAccount}
                  />

                  {!isDerivatives &&
                    this.props.viewMode !== OrderFormViewMode.HORIZONTAL && (
                      <div
                        className={classNames(styles.FieldInfo, styles.PP)}
                      >{`${t('PP')}: ${formatNumber(
                        purchasingPower,
                        undefined,
                        undefined,
                        undefined,
                        '--'
                      )}`}</div>
                    )}
                </div>
              </div>
              {!isDerivatives &&
                this.props.viewMode === OrderFormViewMode.HORIZONTAL && (
                  <div className={styles.FieldInfo}>{`${t(
                    'PP'
                  )}: ${formatNumber(
                    purchasingPower,
                    undefined,
                    undefined,
                    undefined,
                    '--'
                  )}`}</div>
                )}
              <ErrorMessage message={errors.accountNumber} />
            </div>
          )}

          {config[OrderFormFieldKey.SYMBOL] != null && (
            <div
              className={classNames(styles.SymbolSection, styles.FormField, {
                [styles.Vertical]:
                  this.props.viewMode !== OrderFormViewMode.HORIZONTAL,
              })}
              style={config[OrderFormFieldKey.SYMBOL]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Symbol Code')}</div>
                <div className={styles.FieldInput}>
                  <SymbolSearch
                    isForm={true}
                    placeholder={currentSymbolDesc}
                    onSymbolSearch={this.onSymbolSearch}
                    removeIndexStock={true}
                    verticalPosition={
                      this.props.viewMode === OrderFormViewMode.HORIZONTAL
                        ? 'top'
                        : 'bottom'
                    }
                  />
                </div>
              </div>
              {this.props.viewMode !== OrderFormViewMode.HORIZONTAL && (
                <div style={config[OrderFormFieldKey.CURRENT_PRICE]?.style}>
                  <CurrentPriceField onClickPrice={this.onClickPrice} />
                </div>
              )}
              {!isDerivatives && (
                <div
                  className={classNames(styles.FieldInfo, {
                    [styles.Ratio]:
                      this.props.viewMode !== OrderFormViewMode.HORIZONTAL,
                  })}
                  style={config[OrderFormFieldKey.MARGIN_RATIO]?.style}
                >{`${t('Margin Ratio')}: ${marginRatio ?? '--'}%`}</div>
              )}
              <ErrorMessage message={errors.stockCode} />
            </div>
          )}

          {config[OrderFormFieldKey.QUANTITY] != null && (
            <div
              className={classNames(styles.QuantitySection, styles.FormField)}
              style={config[OrderFormFieldKey.QUANTITY]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Quantity')}</div>
                <div
                  className={classNames(styles.FieldInput, {
                    [styles.HeightQuantityList]:
                      !isDerivatives && values.orderQuantityType === 'share',
                  })}
                >
                  <QuantityInput
                    data={symbol}
                    onChange={this.onChangeQuantity}
                    onBlur={this.onBlurQuantity}
                    percentage={values.orderQuantityPercentage}
                    maxQty={
                      isStopLimitOrder || isConditionalOrder
                        ? undefined
                        : maxQty
                    }
                    value={values.orderQuantity}
                    quantityType={values.orderQuantityType}
                    disableQuantityTypes={
                      isDerivatives || values.orderType !== OrderType.LO
                        ? ['amount']
                        : isStopLimitOrder
                        ? ['percentage']
                        : []
                    }
                    error={errors.orderQuantity != null}
                    isOddlot={isOddlot}
                    disableQuantityType={
                      (isDerivatives && isConditionalOrder) || isOddlot
                    }
                    orderType={values.orderType}
                  />
                </div>
              </div>
              <div
                className={classNames(styles.FieldInfo, {
                  [styles.Ratio]:
                    this.props.viewMode !== OrderFormViewMode.HORIZONTAL,
                })}
                style={{ whiteSpace: 'nowrap' }}
              >{`${t('Max Qtt: 1')}: ${formatNumber(
                values.maxQty,
                undefined,
                undefined,
                undefined,
                '--'
              )}`}</div>
              <ErrorMessage message={errors.orderQuantity} />
            </div>
          )}

          {config[OrderFormFieldKey.CONDITIONAL_TYPE] != null && (
            <div
              className={classNames(
                styles.ConditionalSection,
                styles.FormField
              )}
              style={config[OrderFormFieldKey.CONDITIONAL_TYPE]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Conditional Type')}</div>
                <div className={styles.FieldInput}>
                  <Dropdown
                    isForm={true}
                    data={DERIVATIVES_CONDITIONAL_TYPE}
                    onSelect={this.onChangeConditionType}
                    activeItem={values.conditionalType}
                  />
                </div>
              </div>
              <ErrorMessage message={errors.conditionalType} />
            </div>
          )}

          {(isConditionalOrder
            ? values.conditionalType !== DerivativesConditionalType.STOP_LIMIT
            : config[OrderFormFieldKey.PRICE] != null) && (
            <div
              className={classNames(styles.PriceSection, styles.FormField)}
              style={config[OrderFormFieldKey.PRICE]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Price')}</div>
                <div className={styles.FieldInput}>
                  <PriceInput
                    data={symbol}
                    onChange={this.onChangePrice}
                    onBlur={this.onBlurPrice}
                    onChangeOrderType={this.onChangeOrderType}
                    value={values.orderPrice}
                    error={errors.orderPrice != null}
                    orderType={values.orderType}
                    orderKind={this.props.orderKind}
                    position={
                      this.props.viewMode === OrderFormViewMode.HORIZONTAL
                        ? 'top'
                        : 'bottom'
                    }
                  />
                </div>
              </div>
              <ErrorMessage message={errors.orderPrice} />
            </div>
          )}
          {isNormalOrder && (
            <div
              className={classNames(styles.OrderTypeSection, styles.FormField)}
              style={config[OrderFormFieldKey.ORDER_TYPES]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Order Type')}</div>
                <div className={styles.FieldInput}>
                  <PriceInput
                    data={symbol}
                    // onChange={this.onChangePrice}
                    onBlur={this.onBlurPrice}
                    onChangeOrderType={this.onChangeOrderType}
                    // value={values.orderType}
                    error={errors.orderType != null}
                    orderType={values.orderType}
                    orderKind={this.props.orderKind}
                    position={
                      this.props.viewMode === OrderFormViewMode.HORIZONTAL
                        ? 'top'
                        : 'bottom'
                    }
                    isOrderTypeComponent={true}
                  />
                </div>
              </div>
              <ErrorMessage message={errors.orderType} />
            </div>
          )}

          {config[OrderFormFieldKey.TRIGGER_PRICE] != null &&
            values.conditionalType &&
            [
              DerivativesConditionalType.UP,
              DerivativesConditionalType.DOWN,
              DerivativesConditionalType.OCO,
              DerivativesConditionalType.TRAILING_UP,
              DerivativesConditionalType.TRAILING,
            ].includes(values.conditionalType) && (
              <div
                className={classNames(
                  styles.TriggerPriceSection,
                  styles.FormField
                )}
                style={config[OrderFormFieldKey.TRIGGER_PRICE]?.style}
              >
                <div className={styles.MainField}>
                  <div className={styles.FieldTitle}>{t('Trigger Price')}</div>
                  <div className={styles.FieldInput}>
                    <PriceInput
                      data={symbol}
                      onChange={this.onChangeTriggerPrice}
                      value={values.triggerPrice}
                      disableOrderType={true}
                      error={errors.triggerPrice != null}
                      orderKind={this.props.orderKind}
                    />
                  </div>
                </div>
                <ErrorMessage message={errors.triggerPrice} />
              </div>
            )}

          {config[OrderFormFieldKey.TOLER] != null && !isDerivatives && (
            <div
              className={classNames(styles.TolerSection, styles.FormField)}
              style={config[OrderFormFieldKey.TOLER]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Toler')}</div>
                <div className={styles.FieldInput}>
                  <PriceInput
                    data={symbol}
                    onChange={this.onChangeToler}
                    value={values.toler}
                    error={errors.toler != null}
                    orderKind={this.props.orderKind}
                  />
                </div>
              </div>
              <ErrorMessage message={errors.toler} />
            </div>
          )}

          {config[OrderFormFieldKey.TOLER] != null &&
            values.conditionalType === DerivativesConditionalType.OCO &&
            isDerivatives && (
              <div
                className={classNames(styles.FormField)}
                style={config[OrderFormFieldKey.TOLER]?.style}
              >
                <div className={styles.MainField}>
                  <div className={styles.FieldTitle}>{t('Toler')}</div>
                  <div className={styles.FieldInput}>
                    <PriceInput
                      data={symbol}
                      onChange={this.onChangeToler}
                      value={values.toler}
                      error={errors.toler != null}
                      orderKind={this.props.orderKind}
                    />
                  </div>
                </div>
                <ErrorMessage message={errors.toler} />
              </div>
            )}

          {config[OrderFormFieldKey.STOP_TIME] != null &&
            values.conditionalType === DerivativesConditionalType.TIME && (
              <div
                className={classNames(styles.StopTimeSection, styles.FormField)}
                style={config[OrderFormFieldKey.STOP_TIME]?.style}
              >
                <div className={styles.MainField}>
                  <div className={styles.FieldTitle}>{t('Stop Time')}</div>
                  <div className={styles.FieldInput}>
                    <DatePicker
                      onChange={this.onChangeStopTime}
                      selected={
                        values.stopTime
                          ? formatStringToDate(values.stopTime, 'HHmm')
                          : null
                      }
                      showTimeSelect={true}
                      showTimeSelectOnly={true}
                      timeIntervals={10}
                      timeCaption={t('Time')}
                      dateFormat="HH:mm"
                    />
                  </div>
                </div>
                <ErrorMessage message={errors.stopTime} />
              </div>
            )}

          {(isConditionalOrder
            ? values.conditionalType === DerivativesConditionalType.STOP_LIMIT
            : config[OrderFormFieldKey.STOP_PRICE] != null) && (
            <div
              className={classNames(styles.StopPriceSection, styles.FormField)}
              style={config[OrderFormFieldKey.STOP_PRICE]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Stop Price')}</div>
                <div className={styles.FieldInput}>
                  <PriceInput
                    data={symbol}
                    onChange={this.onChangeStopPrice}
                    onBlur={this.onBlurStopPrice}
                    value={values.stopPrice}
                    error={errors.stopPrice != null}
                    orderKind={this.props.orderKind}
                    disableOrderType={true}
                  />
                </div>
              </div>
              <ErrorMessage message={errors.stopPrice} />
            </div>
          )}

          {(isConditionalOrder
            ? values.conditionalType === DerivativesConditionalType.STOP_LIMIT
            : config[OrderFormFieldKey.LIMIT_PRICE] != null) && (
            <div
              className={classNames(styles.LimitPriceSection, styles.FormField)}
              style={config[OrderFormFieldKey.LIMIT_PRICE]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Limit Price')}</div>
                <div className={styles.FieldInput}>
                  <PriceInput
                    data={symbol}
                    onChange={this.onChangePrice}
                    onBlur={this.onBlurPrice}
                    onChangeOrderType={this.onChangeOrderType}
                    value={values.orderPrice}
                    error={errors.orderPrice != null}
                    orderKind={this.props.orderKind}
                    orderType={values.orderType}
                    disableOrderType={values.market === Market.UPCOM}
                  />
                </div>
              </div>
              <ErrorMessage message={errors.orderPrice} />
            </div>
          )}

          {config[OrderFormFieldKey.TRADING_VALUE] != null && (
            <div
              className={classNames(
                styles.TradingValueSection,
                styles.FormField,
                {
                  [styles.HiddenField]:
                    isDerivatives ||
                    (values.orderType !== OrderType.LO &&
                      values.orderType !== OrderType.ODDLOT),
                }
              )}
              style={config[OrderFormFieldKey.TRADING_VALUE]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldTitle}>{t('Trading Value')}</div>
                <div className={styles.FieldInput}>
                  <NumericInput
                    onNumberChange={this.onChangeTradingValue}
                    readOnly={values.orderQuantityType !== 'amount'}
                    value={values.tradingValue}
                    step={quantityStep}
                    onBlur={this.onBlurTradingValue}
                  />
                </div>
              </div>
              <ErrorMessage message={errors.tradingValue} />
            </div>
          )}

          {config[OrderFormFieldKey.EXPIRY_DATE] != null && (
            <div
              className={classNames(
                styles.ExpiryDateSection,
                styles.FormField,
                {
                  [styles.HiddenField]: isDerivatives,
                }
              )}
              style={config[OrderFormFieldKey.EXPIRY_DATE]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldInput}>
                  <CheckBox
                    disabled={isDerivatives || isOddlot}
                    label={'Expiry Date'}
                    onChange={this.onChangeExpiryCheckBox}
                    checked={values.expiryDate != null}
                  />
                  <DatePicker
                    onChange={this.onChangeExpiryDate}
                    selected={
                      values.expiryDate
                        ? formatStringToDate(values.expiryDate, 'yyyyMMdd')
                        : null
                    }
                    disabled={values.expiryDate == null}
                    position="right"
                    minDate={dateFns.add(new Date(), { days: 1 })}
                    dateFormat={DATE_FORMAT_DISPLAY}
                  />
                </div>
              </div>
              <ErrorMessage message={errors.expiryDate} />
            </div>
          )}

          {(isConditionalOrder
            ? values.conditionalType === DerivativesConditionalType.STOP_LIMIT
            : config[OrderFormFieldKey.STOP_DATE] != null) && (
            <div
              className={classNames(styles.StopDateSection, styles.FormField)}
              style={config[OrderFormFieldKey.STOP_DATE]?.style}
            >
              <div className={styles.MainField}>
                {this.props.viewMode !== OrderFormViewMode.HORIZONTAL && (
                  <div className={styles.FieldTitle}>
                    <div className={styles.Title}>{t('From Date')}</div>
                    <div className={styles.Title}>{t('To Date')}</div>
                  </div>
                )}
                <div className={styles.FieldInput}>
                  <DateRangePicker
                    onChangeStartDate={this.onChangeStartDate}
                    onChangeEndDate={this.onChangeEndDate}
                    startDate={
                      values.startDate
                        ? formatStringToDate(values.startDate)
                        : null
                    }
                    endDate={
                      values.endDate ? formatStringToDate(values.endDate) : null
                    }
                    showLabel={
                      this.props.viewMode === OrderFormViewMode.HORIZONTAL
                    }
                    minDate={new Date()}
                  />
                </div>
              </div>
              <ErrorMessage message={errors.startDate} />
            </div>
          )}

          {config[OrderFormFieldKey.PROFIT] != null &&
            values.conditionalType === DerivativesConditionalType.BULL_BEAR && (
              <div
                className={classNames(
                  styles.PositionSection,
                  styles.FormFieldContainer
                )}
                style={config[OrderFormFieldKey.PROFIT]?.style}
              >
                <div className={styles.FieldTitle}>{t('Profit')}</div>
                {config[OrderFormFieldKey.PROFIT_STEP] != null && (
                  <div
                    className={classNames(styles.FormField)}
                    style={config[OrderFormFieldKey.PROFIT_STEP]?.style}
                  >
                    <div className={styles.FieldTitle}>{t('Profit Step')}</div>
                    <div className={styles.FieldInput}>
                      <PriceInput
                        data={symbol}
                        onChange={this.onChangeProfitStep}
                        value={values.profitStep}
                        error={errors.profitStep != null}
                        orderKind={this.props.orderKind}
                      />
                    </div>
                    <ErrorMessage message={errors.profitStep} />
                  </div>
                )}
                {config[OrderFormFieldKey.PROFIT_PRICE] != null && (
                  <div
                    className={classNames(styles.FormField)}
                    style={config[OrderFormFieldKey.PROFIT_PRICE]?.style}
                  >
                    <div className={styles.FieldTitle}>{t('Profit Price')}</div>
                    <div className={styles.FieldInput}>
                      <PriceInput
                        data={symbol}
                        onChange={this.onChangeProfitPrice}
                        value={values.profitPrice}
                        error={errors.profitPrice != null}
                        orderKind={this.props.orderKind}
                      />
                    </div>
                    <ErrorMessage message={errors.profitPrice} />
                  </div>
                )}
              </div>
            )}

          {config[OrderFormFieldKey.LOSS] != null &&
            values.conditionalType === DerivativesConditionalType.BULL_BEAR && (
              <div
                className={classNames(
                  styles.PositionSection,
                  styles.FormFieldContainer
                )}
                style={config[OrderFormFieldKey.LOSS]?.style}
              >
                <div className={styles.FieldTitle}>{t('Loss')}</div>
                {config[OrderFormFieldKey.LOSS_STEP] != null && (
                  <div
                    className={classNames(styles.FormField)}
                    style={config[OrderFormFieldKey.LOSS_STEP]?.style}
                  >
                    <div className={styles.FieldTitle}>{t('Loss Step')}</div>
                    <div className={styles.FieldInput}>
                      <PriceInput
                        data={symbol}
                        onChange={this.onChangeLossStep}
                        value={values.lossStep}
                        error={errors.lossStep != null}
                        orderKind={this.props.orderKind}
                      />
                    </div>
                    <ErrorMessage message={errors.lossStep} />
                  </div>
                )}
                {config[OrderFormFieldKey.LOSS_PRICE] != null && (
                  <div
                    className={classNames(styles.FormField)}
                    style={config[OrderFormFieldKey.LOSS_PRICE]?.style}
                  >
                    <div className={styles.FieldTitle}>{t('Loss Price')}</div>
                    <div className={styles.FieldInput}>
                      <PriceInput
                        data={symbol}
                        onChange={this.onChangeLossPrice}
                        value={values.lossPrice}
                        error={errors.lossPrice != null}
                        orderKind={this.props.orderKind}
                      />
                    </div>
                    <ErrorMessage message={errors.lossPrice} />
                  </div>
                )}
                {config[OrderFormFieldKey.TOLER] != null && (
                  <div
                    className={classNames(styles.FormField)}
                    style={config[OrderFormFieldKey.TOLER]?.style}
                  >
                    {/* <div className={styles.MainField}> */}
                    <div className={styles.FieldTitle}>{t('Toler')}</div>
                    <div className={styles.FieldInput}>
                      <PriceInput
                        data={symbol}
                        onChange={this.onChangeToler}
                        value={values.toler}
                        error={errors.toler != null}
                        orderKind={this.props.orderKind}
                      />
                      {/* </div> */}
                    </div>
                    <ErrorMessage message={errors.toler} />
                  </div>
                )}
              </div>
            )}

          {false && config[OrderFormFieldKey.POSITION] != null && (
            <div
              className={classNames(styles.PositionSection, styles.FormField)}
              style={config[OrderFormFieldKey.POSITION]?.style}
            >
              <PositionField />
            </div>
          )}

          <div
            className={classNames(styles.ConfirmSection, styles.FormField, {
              [styles.DerivativesField]: isDerivatives,
              [styles.Vertical]:
                this.props.viewMode !== OrderFormViewMode.HORIZONTAL,
            })}
            style={
              isNormalOrder
                ? config[OrderFormFieldKey.CONFIRM_NORMAL]?.style
                : config[OrderFormFieldKey.CONFIRM]?.style
            }
          >
            <div className={styles.MainField}>
              <div className={styles.FieldInput}>
                {!isNormalOrder && (
                  <ToggleSwitch
                    label={'Skip Confirmation'}
                    onChange={this.onChangeConfirmation}
                    checked={values.skipConfirmation}
                  />
                )}

                <div className={styles.SubmitButton}>
                  <button
                    className={classNames({
                      [styles.BuySubmitButton]:
                        values.sellBuyType === SellBuyType.BUY,
                      [styles.SellSubmitButton]:
                        values.sellBuyType === SellBuyType.SELL,
                    })}
                    type="button"
                    onClick={this.onOpenModal}
                    disabled={isSubmitDisabled}
                  >
                    {t(`${values.sellBuyType} 2`)}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isNormalOrder && (
            <div
              className={classNames(styles.SkipSection, styles.FormField, {
                [styles.DerivativesField]: isDerivatives,
              })}
              style={config[OrderFormFieldKey.SKIP_CONFIRMATION]?.style}
            >
              <div className={styles.MainField}>
                <div className={styles.FieldInput}>
                  <ToggleSwitch
                    label={'Skip Confirmation'}
                    onChange={this.onChangeConfirmation}
                    checked={values.skipConfirmation}
                  />
                </div>
              </div>
            </div>
          )}
        </Form>

        {isNormalOrder && this.props.viewMode === OrderFormViewMode.HORIZONTAL && (
          <div
            className={classNames(styles.CashInformation, {
              [styles.TypeNotMargin]:
                this.props.selectedAccount?.accountType !== AccountType.MARGIN,
            })}
          >
            <Row>
              <Col lg={4} sm={6} className="mt-3 pr-0">
                <div className={classNames(styles.TableCashInformation)}>
                  <table>
                    <thead>
                      <tr className={styles.Row}>
                        <th colSpan={2}>{t('Cash Information')}</th>
                        <th>
                          <div
                            className={classNames(styles.FaDown, {
                              [styles.Active]: this.state.isTableCashOpen,
                            })}
                            onClick={this.clickCash}
                          >
                            <FaCaretDown />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    {this.state.isTableCashOpen && (
                      <tbody>
                        {isDerivatives
                          ? assetDer.map((asset, i) => (
                              <tr key={i}>
                                <td>{t(asset.title)}</td>
                                <td>{asset.value}</td>
                              </tr>
                            ))
                          : assetEquity.map((asset, i) => (
                              <tr key={i}>
                                <td>{t(asset.title)}</td>
                                <td>{asset.value}</td>
                              </tr>
                            ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {isNormalOrder &&
          this.props.selectedAccount?.accountType === AccountType.MARGIN &&
          this.props.viewMode === OrderFormViewMode.HORIZONTAL && (
            <div className={styles.MarginInformation}>
              <Row>
                <Col lg={4} sm={6} className="mt-3 pl-0">
                  <div className={styles.TableMarginInformation}>
                    <table>
                      <thead>
                        <tr className={styles.Row}>
                          <th>{t('Margin Information')}</th>
                          <th>
                            <div
                              className={classNames(styles.FaDown, {
                                [styles.Active]: this.state.isTableMarginOpen,
                              })}
                              onClick={this.clickMargin}
                            >
                              <FaCaretDown />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      {this.state.isTableMarginOpen && (
                        <tbody>
                          {equityMargin
                            .filter((item) => item.hide === false)
                            .map((item, index) => (
                              <tr key={index}>
                                <td>{t(item.title)}</td>
                                <td>
                                  {item.value}
                                  {item.title.indexOf('%') !== -1 && '%'}
                                  {item.title.indexOf('rate') !== -1 && '%'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      )}
                    </table>
                  </div>
                </Col>
              </Row>
            </div>
          )}

        <OtpModal
          show={values.isConfirmModalOpened}
          onHide={this.onCloseModal}
          onSubmit={this.onSubmit}
          isSubmitDisabled={isSubmitDisabled}
        >
          {values.skipConfirmation ? null : (
            <div className={styles.ConfirmTable}>
              <div className={styles.Title}>
                {t(
                  utils.getTitleModal(
                    this.props.values.sellBuyType,
                    this.props.orderKind
                  )
                )}
              </div>
              <table>
                <colgroup>
                  <col span={1} style={{ width: '50%' }} />
                  <col span={1} style={{ width: '50%' }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td>{t('Symbol Code')}</td>
                    <td>{values.stockCode}</td>
                  </tr>
                  {this.props.orderKind === OrderKind.QUICK_ORDER ||
                    (this.props.orderKind === OrderKind.NORMAL_ORDER && (
                      <tr>
                        <td>{t('Order Type')}</td>
                        <td>{values.orderType}</td>
                      </tr>
                    ))}
                  <tr>
                    <td>{t('Quantity')}</td>
                    <td>{formatNumber(values.orderQuantity, 2)}</td>
                  </tr>
                  {isStopLimitOrder || isConditionalOrder ? (
                    <>
                      {values.stopPrice && (
                        <tr>
                          <td>{t('Stop Price')}</td>
                          <td>{formatNumber(values.stopPrice, 2)}</td>
                        </tr>
                      )}
                      {values.orderPrice && (
                        <tr>
                          <td>{t('Limit Price')}</td>
                          <td>{formatNumber(values.orderPrice, 2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td>{t('From Date')}</td>
                        <td>{formatDateToDisplay(values.startDate)}</td>
                      </tr>
                      <tr>
                        <td>{t('To Date')}</td>
                        <td>{formatDateToDisplay(values.endDate)}</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      {values.orderPrice && (
                        <tr>
                          <td>{t('Price')}</td>
                          <td>{formatNumber(values.orderPrice, 2)}</td>
                        </tr>
                      )}
                      {!isDerivatives &&
                        (values.orderType === OrderType.LO ||
                          values.orderType === OrderType.ODDLOT) && (
                          <tr>
                            <td>{t('Trading Value')}</td>
                            <td>{formatNumber(values.tradingValue, 2)}</td>
                          </tr>
                        )}
                      {values.expiryDate && (
                        <tr>
                          <td>{t('Expiry Date')}</td>
                          <td>{formatDateToDisplay(values.expiryDate)}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
      </ScrollBar>
    );
  }

  private queryConfirmDebt = (signed?: boolean) => {
    if (this.props.selectedAccount?.account) {
      this.props.queryEquityConfirmDebt({
        accountNumber: this.props.selectedAccount?.account,
        historyBy: 0,
        signed: signed ?? false,
      });
    }
  };

  private onCloseModalConfirmDebt = () => {
    this.setState({ isConfirmDebt: false });
  };

  private clickMargin = () => {
    this.props.changeOrderFormHeight({
      height: !this.state.isTableMarginOpen ? 320 : 240,
    });
    this.setState({ isTableMarginOpen: !this.state.isTableMarginOpen });
  };
  private clickCash = () => {
    if (this.props.selectedAccount?.type === SystemType.DERIVATIVES) {
      this.props.changeOrderFormHeight({
        height: !this.state.isTableCashOpen ? 320 : 240,
      });
    }
    this.setState({ isTableCashOpen: !this.state.isTableCashOpen });
  };

  private onChangeAccount = (account?: IAccount) => {
    this.props.setFieldValue('accountNumber', account?.accountNumber);
  };

  private onChangeBuyType = () => {
    this.queryOrderStockInfo(SellBuyType.BUY);
    this.setValues({
      sellBuyType: SellBuyType.BUY,
      orderQuantityType: 'share',
    });
  };

  private onChangeSellType = () => {
    this.queryOrderStockInfo(SellBuyType.SELL);
    this.setValues({
      sellBuyType: SellBuyType.SELL,
      orderQuantityType: 'share',
    });
  };

  private onClickPrice = (orderPrice?: number) => {
    const tradingValue =
      this.props.values.orderQuantity && orderPrice
        ? this.props.values.orderQuantity * orderPrice
        : 0;
    if (
      this.props.values.orderType === OrderType.LO ||
      this.props.values.orderType === OrderType.ODDLOT
    ) {
      const orderKind =
        this.props.orderKind === OrderKind.STOP_LIMIT_ORDER ||
        this.props.orderKind === OrderKind.CONDITIONAL_ORDER;
      this.setValues({
        orderPrice,
        tradingValue,
        ...(orderKind && { stopPrice: orderPrice }),
      });
      this.queryOrderStockInfo(undefined, orderPrice);
    }
  };

  private onChangeQuantity = (
    quantity: number | undefined,
    orderQuantityType: 'share' | 'amount' | 'percentage',
    orderQuantityPercentage?: number
  ) => {
    const tradingValue =
      this.props.values.orderPrice && quantity
        ? this.props.values.orderPrice * quantity
        : 0;
    this.setValues({
      orderQuantity: quantity || 0,
      orderQuantityPercentage,
      orderQuantityType,
      tradingValue,
    });
  };

  private onBlurQuantity = (value: number | undefined) => {
    const { values } = this.props;
    const orderQuantity =
      values.orderType === OrderType.ODDLOT
        ? Number(values.orderQuantity) > 0
          ? values.orderQuantity
          : 0
        : roundLot(
            Number(value),
            values.market,
            values.symbolType,
            undefined,
            true
          );
    const tradingValue =
      values.orderPrice && orderQuantity
        ? +Big(values.orderPrice).times(orderQuantity)
        : 0;
    const orderQuantityPercentage = values.maxQty
      ? +Big(orderQuantity).div(values.maxQty).times(100).toFixed(2)
      : 0;
    this.setValues({
      orderQuantity,
      orderQuantityPercentage,
      tradingValue,
    });
  };

  private roundStepPrice = (priceStep: number) => {
    const { values } = this.props;
    const orderPrice = roundStep(values.orderPrice, priceStep);
    const tradingValue =
      values.orderQuantity && orderPrice && typeof orderPrice === 'number'
        ? this.props.values.orderQuantity * orderPrice
        : 0;
    this.setValues({ orderPrice, tradingValue });
  };

  private onBlurPrice = (priceStep?: number) => {
    if (
      this.props.values.orderType === OrderType.LO ||
      this.props.values.orderType === OrderType.ODDLOT
    ) {
      debounce(this.roundStepPrice, 0)(priceStep);
    }
  };

  private onChangePrice = (orderPrice?: number) => {
    const tradingValue =
      this.props.values.orderQuantity &&
      orderPrice &&
      typeof orderPrice === 'number'
        ? this.props.values.orderQuantity * orderPrice
        : 0;

    this.setValues({
      orderPrice,
      tradingValue,
    });
    if (
      this.props.values.orderType === OrderType.LO ||
      this.props.values.orderType === OrderType.ODDLOT
    ) {
      debounce(this.queryOrderStockInfo, 1000)();
    }
  };

  private onChangeTriggerPrice = (triggerPrice?: number) => {
    this.setValues({ triggerPrice });
  };

  private onChangeToler = (toler?: number) => {
    this.setValues({ toler });
  };

  private onChangeOrderType = (orderType: OrderType) => {
    const { values } = this.props;
    const orderQuantity =
      orderType === OrderType.ODDLOT
        ? getMinLot(
            values.market,
            values.symbolType,
            orderType === OrderType.ODDLOT
          )
        : roundLot(
            values.orderQuantity,
            values.market,
            values.symbolType,
            undefined,
            true
          );

    if (orderType !== OrderType.LO && orderType !== OrderType.ODDLOT) {
      this.setValues({
        orderType,
        orderQuantity,
        orderQuantityType: 'share',
        orderPrice: undefined,
        tradingValue: undefined,
      });
    } else {
      const orderPrice = values.currentPrice || values.referencePrice;
      const tradingValue =
        orderQuantity && orderPrice ? orderQuantity * orderPrice : 0;
      this.setValues({
        orderPrice,
        tradingValue,
        orderType,
        orderQuantity,
        ...(orderType === OrderType.ODDLOT && {
          orderQuantityType: 'share',
        }),
      });
    }
  };

  private onChangeTradingValue = (tradingValue: number | undefined) => {
    const orderQuantity =
      tradingValue && this.props.values.orderPrice
        ? Math.round(tradingValue / this.props.values.orderPrice)
        : 0;
    this.setValues({ tradingValue, orderQuantity });
  };

  private onBlurTradingValue = () => {
    const orderQuantity = roundLot(
      this.props.values.orderQuantity,
      this.props.values.market,
      this.props.values.symbolType,
      undefined,
      true
    );
    const tradingValue =
      this.props.values.orderPrice != null
        ? +Big(orderQuantity).times(this.props.values.orderPrice)
        : 0;
    this.setValues({ tradingValue, orderQuantity });
  };

  private onChangeExpiryDate = (date: Date) => {
    this.setValues({ expiryDate: formatDateToString(date, 'yyyyMMdd') });
  };

  private onChangeStopTime = (date: Date) => {
    this.setValues({ stopTime: formatDateToString(date, 'HHmm') });
  };

  private onSymbolSearch = (stockCode: string | null) => {
    if (stockCode != null) {
      this.props.onSymbolSearch?.(stockCode);
      this.setValues({ stockCode });
    }
  };

  private roundStepStopPrice = (step?: number) => {
    const stopPrice = roundStep(this.props.values.stopPrice, step);
    this.setValues({ stopPrice });
  };

  private onBlurStopPrice = (priceStep?: number) => {
    debounce(this.roundStepStopPrice, 0)(priceStep);
  };

  private onChangeStopPrice = (stopPrice?: number) => {
    this.setValues({ stopPrice });
  };

  private onChangeProfitStep = (profitStep?: number) => {
    this.setValues({ profitStep });
  };

  private onChangeProfitPrice = (profitPrice?: number) => {
    this.setValues({ profitPrice });
  };

  private onChangeLossStep = (lossStep?: number) => {
    this.setValues({ lossStep });
  };

  private onChangeLossPrice = (lossPrice?: number) => {
    this.setValues({ lossPrice });
  };

  private onChangeStartDate = (date: Date) => {
    const { values } = this.props;
    const stringDate = formatDateToString(date);
    if (
      values.endDate != null &&
      values.startDate != null &&
      formatStringToDate(values.endDate).getTime() < date.getTime()
    ) {
      this.setValues({ startDate: stringDate, endDate: stringDate });
    } else {
      this.setValues({ startDate: stringDate });
    }
  };

  private onChangeEndDate = (date: Date) => {
    this.setValues({ endDate: formatDateToString(date) });
  };

  private onChangeExpiryCheckBox = (value: boolean) => {
    this.setValues({
      expiryDate: value
        ? formatDateToString(dateFns.add(new Date(), { days: 1 }))
        : undefined,
    });
  };

  private onChangeConfirmation = (checked: boolean) => {
    this.setValues({ skipConfirmation: checked });
  };

  private onChangeConditionType = (title: string, value: string) => {
    this.setValues({ conditionalType: value as DerivativesConditionalType });
  };

  private onCloseModal = () => {
    this.setValues({ isConfirmModalOpened: false });
  };

  private onOpenModal = () => {
    const isConfirmDebt =
      _.isEmpty(this.props.equityConfirmDebt.data?.resConfirmDebt) ||
      this.props.equityConfirmDebt.data?.resConfirmDebt.status;
    if (
      !isConfirmDebt &&
      this.props.selectedAccount?.accountType === AccountType.MARGIN &&
      this.props.values.sellBuyType === SellBuyType.BUY
    ) {
      this.setState({ isConfirmDebt: true });
    } else {
      if (!this.props.isValid) {
        return;
      }

      if (this.props.values.skipConfirmation) {
        if (this.props.otpToken != null) {
          this.props.handleSubmit();
        } else {
          this.setValues({ isConfirmModalOpened: true });
        }
      } else {
        this.setValues({ isConfirmModalOpened: true });
      }
    }
  };

  private onSubmit = () => {
    this.props.handleSubmit();
  };

  private setValues = (values: Partial<IOrderForm>) => {
    this.props.setValues({
      ...this.props.values,
      ...values,
    });
  };

  private queryOrderStockInfo = (
    sellBuyType?: SellBuyType,
    orderPrice?: number
  ) => {
    const { values, selectedAccount } = this.props;
    if (
      values.market != null &&
      values.referencePrice != null &&
      selectedAccount != null
    ) {
      if (!this.props.orderStockInfo?.data?.PP) {
        this.props.queryOrderStockInfo({
          accountNumber: values.accountNumber,
          accountType: selectedAccount.accountType,
          market: values.market,
          price:
            orderPrice ??
            values.orderPrice ??
            values.currentPrice ??
            values.referencePrice,
          sellBuyType: sellBuyType || values.sellBuyType,
          symbolCode: values.stockCode,
          onlyGetMaxQty: false,
        });
      }

      this.props.queryOrderStockInfo({
        accountNumber: values.accountNumber,
        accountType: selectedAccount.accountType,
        market: values.market,
        price:
          orderPrice ??
          values.orderPrice ??
          values.currentPrice ??
          values.referencePrice,
        sellBuyType: sellBuyType || values.sellBuyType,
        symbolCode: values.stockCode,
        onlyGetMaxQty: true,
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  symbolList: state.symbolList,
  currentSymbol: state.currentSymbol,
  currentSymbolData: state.currentSymbolData,
  selectedAccount: state.selectedAccount,
  lang: state.lang,
  orderStockInfo: state.orderStockInfo,
  otpToken: state.otpToken,
  placeOrderResult: state.placeOrderResult,
  configHyperLink: state.config,
  assetInformation: state.assetInformation,
  assetInforDerivatives: state.assetInforDerivatives,
  equityConfirmDebt: state.equityConfirmDebt,
});

const mapDispatchToProps = {
  openOtpModal,
  queryOrderStockInfo,
  getAssetInformation,
  changeOrderFormHeight,
  getAssetInforDerivatives,
  queryEquityConfirmDebt,
};

const OrderForm = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OrderFormComponent)
  ),
  Fallback,
  handleError
);

const ErrorMessage: React.FC<{ readonly message?: string }> = ({ message }) =>
  message ? (
    <span className={styles.FieldError} title={message}>
      {message}
    </span>
  ) : null;

export default OrderForm;
