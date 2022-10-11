import * as React from 'react';
import * as _ from 'lodash';
import * as styles from './styles.scss';
import { ClockSVG, FacebookSVG, MaceSVG } from 'assets/svg';
import { DERIVATIVES_ORDER_TAB, EQUITY_ORDER_TAB } from './config';
import { Fallback } from 'components/common';
import {
  FunctionKey,
  Market,
  MarketStatus,
  SocketStatus,
  SystemType,
} from 'constants/enum';
import { IState } from 'redux/global-reducers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  changeFooterFunction,
  changeSidebarFunction,
} from 'components/common/SideBarFunction/actions';
import { changeOrderFormHeight } from '../OrderForm/actions';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Clock from './Clock';
import TabTable from '../TabTable';
import classNames from 'classnames';

export interface IFooterSectionProps
  extends React.ClassAttributes<FooterSectionComponent>,
    WithNamespaces {
  readonly isAuthenticated: IState['isAuthenticated'];
  readonly sideBarFunction: IState['sideBarFunction'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly marketStatus: IState['marketStatus'];
  readonly socketStatus: IState['socketStatus'];
  readonly wtsSocketStatus: IState['wtsSocketStatus'];
  readonly config: IState['config'];
  readonly orderStockChangeHeight: IState['orderStockChangeHeight'];

  readonly changeSidebarFunction: typeof changeSidebarFunction;
  readonly changeFooterFunction: typeof changeFooterFunction;
  readonly changeOrderFormHeight: typeof changeOrderFormHeight;
}

export interface IFooterSectionState {
  readonly isOnline: boolean;
  readonly isOrderFormOpened?: boolean;
}

class FooterSectionComponent extends React.Component<
  IFooterSectionProps,
  IFooterSectionState
> {
  private containerRef: React.RefObject<HTMLDivElement>;

  constructor(props: IFooterSectionProps) {
    super(props);

    this.state = {
      isOnline: navigator.onLine,
    };
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('online', this.handleConnectionChange);
    window.addEventListener('offline', this.handleConnectionChange);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleConnectionChange);
    window.removeEventListener('offline', this.handleConnectionChange);
  }

  render() {
    const { t, config, orderStockChangeHeight } = this.props;
    const mutableMarketStatus: {
      [s: string]: MarketStatus;
    } = {};

    this.props.marketStatus.forEach((val) => {
      if (val.type === SystemType.DERIVATIVES) {
        mutableMarketStatus.DR = val.status;
      } else {
        mutableMarketStatus[val.market] = val.status;
      }
    });

    const tabTableData =
      this.props.selectedAccount?.type === SystemType.DERIVATIVES
        ? DERIVATIVES_ORDER_TAB
        : EQUITY_ORDER_TAB;

    const tooltip = (
      <Tooltip id={`tooltip-socket-status`}>
        <span>{`${t('Price Board')}: `}</span>
        <span
          className={classNames(styles.Status, {
            [styles.Connecting]:
              this.props.socketStatus === SocketStatus.CONNECTING,
            [styles.Disconnected]:
              this.props.socketStatus === SocketStatus.DISCONNECTED,
          })}
        >
          {t(this.props.socketStatus)}
        </span>
        <br />
        <span>{`${t('WTS')}: `}</span>
        <span
          className={classNames(styles.Status, {
            [styles.Connecting]:
              this.props.wtsSocketStatus === SocketStatus.CONNECTING,
            [styles.Disconnected]:
              this.props.wtsSocketStatus === SocketStatus.DISCONNECTED,
          })}
        >
          {t(this.props.wtsSocketStatus)}
        </span>
      </Tooltip>
    );

    return (
      <div className={styles.FooterSection}>
        {this.props.isAuthenticated &&
          this.props.sideBarFunction.footerKey === FunctionKey.ORDER && (
            <div
              className={styles.OrderSection}
              style={{
                height: `${
                  orderStockChangeHeight.data?.height !== null
                    ? orderStockChangeHeight.data?.height
                    : 240
                }px`,
              }}
            >
              <TabTable data={tabTableData} />
            </div>
          )}
        <div className={styles.BarSection}>
          <div className={styles.MarketStatusSection}>
            {(domainConfig[config.domain]?.isHideAndShowQuickOrder
              ? this.props.isAuthenticated
              : true) && (
              <div className={styles.QuickOrder} onClick={this.onClickOrder}>
                <MaceSVG height={18} />
                <span>{t('Quick Order')}</span>
              </div>
            )}
            <div className={styles.ClockSection}>
              <ClockSVG />
              <Clock />
            </div>
            <div className={styles.MarketStatus}>
              <span>HOSE: </span>
              <span
                className={classNames(styles.Status, {
                  [styles.Closed]:
                    mutableMarketStatus[Market.HOSE] === MarketStatus.CLOSED,
                  [styles.Connecting]:
                    mutableMarketStatus[Market.HOSE] ===
                    MarketStatus.INTERMISSION,
                  [styles.NotAvailable]: _.isEmpty(mutableMarketStatus),
                })}
              >
                {!_.isEmpty(mutableMarketStatus)
                  ? t(mutableMarketStatus[Market.HOSE])
                  : 'N/A'}
              </span>
            </div>
            <div className={styles.MarketStatus}>
              <span>HNX: </span>
              <span
                className={classNames(styles.Status, {
                  [styles.Closed]:
                    mutableMarketStatus[Market.HNX] === MarketStatus.CLOSED,
                  [styles.Connecting]:
                    mutableMarketStatus[Market.HNX] ===
                    MarketStatus.INTERMISSION,
                  [styles.NotAvailable]: _.isEmpty(mutableMarketStatus),
                })}
              >
                {!_.isEmpty(mutableMarketStatus)
                  ? t(mutableMarketStatus[Market.HNX])
                  : 'N/A'}
              </span>
            </div>
            <div className={styles.MarketStatus}>
              <span>UPCOM: </span>
              <span
                className={classNames(styles.Status, {
                  [styles.Closed]:
                    mutableMarketStatus[Market.UPCOM] === MarketStatus.CLOSED,
                  [styles.Connecting]:
                    mutableMarketStatus[Market.UPCOM] ===
                    MarketStatus.INTERMISSION,
                  [styles.NotAvailable]: _.isEmpty(mutableMarketStatus),
                })}
              >
                {!_.isEmpty(mutableMarketStatus)
                  ? t(mutableMarketStatus[Market.UPCOM])
                  : 'N/A'}
              </span>
            </div>
            <div className={styles.MarketStatus}>
              <span>DR: </span>
              <span
                className={classNames(styles.Status, {
                  [styles.Closed]:
                    mutableMarketStatus.DR === MarketStatus.CLOSED,
                  [styles.Connecting]:
                    mutableMarketStatus.DR === MarketStatus.INTERMISSION,
                  [styles.NotAvailable]: _.isEmpty(mutableMarketStatus),
                })}
              >
                {!_.isEmpty(mutableMarketStatus)
                  ? t(mutableMarketStatus.DR)
                  : 'N/A'}
              </span>
            </div>
            <OverlayTrigger
              key="socket"
              overlay={tooltip}
              placement="top"
              container={this.containerRef}
              rootClose={true}
              trigger="click"
            >
              <div className={styles.MarketStatus} ref={this.containerRef}>
                <span>{`${t('System')}: `}</span>
                <span
                  className={classNames(styles.Status, {
                    [styles.Connecting]:
                      this.props.socketStatus === SocketStatus.CONNECTING,
                    [styles.Disconnected]:
                      this.props.socketStatus === SocketStatus.DISCONNECTED,
                  })}
                >
                  {t(this.props.socketStatus)}
                </span>
              </div>
            </OverlayTrigger>
            {config.companyInfo[config.domain]?.socialUrl && (
              <div className={styles.SocialSection}>
                <a
                  href={
                    config
                      ? config.companyInfo[config.domain]?.socialUrl || '#'
                      : '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <FacebookSVG height={16} />
                  <span>{t('Like')}</span>
                </a>
              </div>
            )}
          </div>
          {this.props.isAuthenticated && (
            <div className={styles.InfoSection}>
              <div
                className={classNames(styles.InfoItem, {
                  [styles.Active]:
                    this.props.sideBarFunction.key === FunctionKey.ORDER_BOOK,
                })}
                onClick={this.onOrderBookClick}
              >
                {t('Order Book')}
              </div>
              <div
                className={classNames(styles.InfoItem, {
                  [styles.Active]:
                    this.props.sideBarFunction.key === FunctionKey.CASH,
                })}
                onClick={this.onCashClick}
              >
                {t('Cash')}
              </div>
              <div
                className={classNames(styles.InfoItem, {
                  [styles.Active]:
                    this.props.sideBarFunction.key === FunctionKey.PORTFOLIO,
                })}
                onClick={this.onPortfolioClick}
              >
                {t('Portfolio')}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  private handleConnectionChange = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  private onOrderBookClick = () => {
    this.onSidebarFunctionChange(FunctionKey.ORDER_BOOK);
  };

  private onCashClick = () => {
    this.onSidebarFunctionChange(FunctionKey.CASH);
  };

  private onPortfolioClick = () => {
    this.onSidebarFunctionChange(FunctionKey.PORTFOLIO);
  };

  private onSidebarFunctionChange = (key: FunctionKey) => {
    if (this.props.sideBarFunction.key !== key) {
      this.props.changeSidebarFunction({ key });
    } else {
      this.props.changeSidebarFunction({});
    }
  };

  private onClickOrder = () => {
    if (this.props.config.tradingUrl == null) {
      this.setState({ isOrderFormOpened: !this.state.isOrderFormOpened });
      if (this.props.sideBarFunction.footerKey === FunctionKey.ORDER) {
        this.props.changeFooterFunction({});
        this.props.changeOrderFormHeight({
          height: 240,
        });
      } else {
        this.props.changeFooterFunction({ key: FunctionKey.ORDER });
      }
    } else {
      window.open(this.props.config.tradingUrl);
    }
  };
}

const mapStateToProps = (state: IState) => ({
  sideBarFunction: state.sideBarFunction,
  marketStatus: state.marketStatus,
  socketStatus: state.socketStatus,
  wtsSocketStatus: state.wtsSocketStatus,
  isAuthenticated: state.isAuthenticated,
  selectedAccount: state.selectedAccount,
  config: state.config,
  orderStockChangeHeight: state.orderStockChangeHeight,
});

const mapDispatchToProps = {
  changeSidebarFunction,
  changeFooterFunction,
  changeOrderFormHeight,
};

const FooterSection = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(FooterSectionComponent)
  ),
  Fallback,
  handleError
);

export default FooterSection;
