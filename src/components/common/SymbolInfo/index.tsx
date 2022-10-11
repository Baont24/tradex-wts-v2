import * as React from 'react';
import * as _ from 'lodash';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  Dropdown,
  Fallback,
  SymbolPriceDepth,
  SymbolQuote,
  TVChart,
  TabTable,
} from '..';
import {
  FaArrowDown,
  FaArrowUp,
  FaAsterisk,
  FaPlus,
  FaStop,
} from 'react-icons/fa';
import { Global } from 'constants/main';
import { INewSymbolData } from 'interfaces/market';
import { INotification, ITabTableData } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { Lang, SymbolType } from 'constants/enum';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ToastType } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import {
  priceFormatted,
  quantityFormatted,
  tradingValueFormatted,
} from 'utils/board';
import {
  setCurrentSymbol,
  showNotification,
  updateWatchlist,
} from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import classNames from 'classnames';
import getWatchlist from '../../../utils/watchlist';

export interface ISymbolInfoProps
  extends React.ClassAttributes<SymbolInfoComponent>,
    WithNamespaces {
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];
  readonly symbolList: IState['symbolList'];
  readonly newSymbolData: IState['newSymbolData'];
  readonly newIndexData: IState['newIndexData'];
  readonly lang: IState['lang'];
  readonly currentSymbol: IState['currentSymbol'];
  readonly watchlist: IState['watchlist'];
  readonly watchlistServer: IState['watchlistServer'];
  readonly symbolInfoModal: IState['symbolInfoModal'];

  readonly showNotification: typeof showNotification;
  readonly updateWatchlist: typeof updateWatchlist;
  readonly setCurrentSymbol: typeof setCurrentSymbol;

  readonly isInfoFunction?: boolean;
}

class SymbolInfoComponent extends React.Component<ISymbolInfoProps> {
  private localSymbolData?: INewSymbolData;

  constructor(props: ISymbolInfoProps) {
    super(props);

    this.state = {};

    this.localSymbolData =
      props.symbolInfoModal.data || props.currentSymbol.infoData;
  }

  shouldComponentUpdate(nextProps: ISymbolInfoProps) {
    if (nextProps.currentSymbol !== this.props.currentSymbol) {
      this.localSymbolData = {
        s: nextProps.currentSymbol.code,
        ...nextProps.symbolList.map?.[nextProps.currentSymbol.code],
        ...nextProps.currentSymbol.infoData,
      };
      return true;
    }

    if (
      this.props.newSymbolData !== nextProps.newSymbolData &&
      nextProps.newSymbolData?.s === nextProps.currentSymbol.code
    ) {
      this.localSymbolData = {
        ...this.localSymbolData,
        ...nextProps.newSymbolData,
      };

      return true;
    }

    if (
      this.props.newIndexData !== nextProps.newIndexData &&
      nextProps.newIndexData?.s === nextProps.currentSymbol.code &&
      nextProps.currentSymbol.symbolType === SymbolType.INDEX
    ) {
      this.localSymbolData = {
        ...this.localSymbolData,
        ...nextProps.newIndexData,
      };
      return true;
    }

    if (
      this.props.resetMarketDataTrigger !== nextProps.resetMarketDataTrigger
    ) {
      this.props.setCurrentSymbol({
        code: this.props.currentSymbol.code,
        resetData: true,
        forceUpdate: true,
      });
    }

    return false;
  }

  render() {
    const { t } = this.props;

    const companyName =
      this.props.lang === Lang.VI
        ? this.localSymbolData?.n1
        : this.localSymbolData?.n2;

    const priceClassRules = (
      price: number | undefined = this.localSymbolData?.c
    ) =>
      price && this.localSymbolData && this.localSymbolData.re
        ? price === this.localSymbolData.re
          ? globalStyles.Ref
          : price === this.localSymbolData.ce
          ? globalStyles.Ceil
          : price === this.localSymbolData.fl
          ? globalStyles.Floor
          : price > this.localSymbolData.re
          ? globalStyles.Up
          : globalStyles.Down
        : '';

    const priceDepthTab: ITabTableData[] = [
      {
        key: 'price-depth',
        title: t('Price Depth'),
        default: true,
        component: this.localSymbolData && (
          <SymbolPriceDepth
            data={this.localSymbolData}
            isInfoSideMenu={this.props.isInfoFunction}
          />
        ),
      },
    ];

    const quotesTab: ITabTableData[] = [
      {
        key: 'quotes',
        title: t('Quotes'),
        default: true,
        component: <SymbolQuote data={this.localSymbolData} />,
      },
    ];
    const watchlists = this.getWatchList();
    return (
      <div
        className={
          this.props.isInfoFunction
            ? styles.SymbolInfo + ' ' + styles.InfoSideMenuSection
            : styles.SymbolInfo
        }
      >
        {this.localSymbolData && (
          <>
            {!this.props.isInfoFunction && (
              <div className={styles.ChartSection}>
                <TVChart
                  onChartReady={this.onChartReady}
                  locale={this.props.lang}
                  timeFrames={Global.config?.tvTimeFrames}
                  symbol={this.localSymbolData.s}
                  clientId={`tradex_${Global.config?.domain}`}
                />
              </div>
            )}
            <div
              className={
                this.props.isInfoFunction
                  ? styles.InfoSection + ' ' + styles.InfoSideMenu
                  : styles.InfoSection
              }
            >
              <div className={styles.SummarySection}>
                <div className={styles.Summary}>
                  <div className={styles.CompanyTitle}>
                    <div className={styles.Symbol}>
                      <p>{this.localSymbolData.s}</p>
                      <div className={styles.CashDividend}>
                        {this.localSymbolData.ie && (
                          <OverlayTrigger
                            placement={'bottom'}
                            overlay={
                              <Tooltip id={`tooltip-dividend`}>
                                {t('Cash dividend')}
                              </Tooltip>
                            }
                          >
                            <FaAsterisk size={10} />
                          </OverlayTrigger>
                        )}
                      </div>
                      <div className={styles.Market}>
                        {this.localSymbolData.m}
                      </div>
                    </div>
                    {!this.props.isInfoFunction && (
                      <div className={styles.Watchlist}>
                        <Dropdown icon={<FaPlus size={10} />}>
                          {watchlists && watchlists.length > 0 ? (
                            watchlists.map((val, idx) => {
                              const onSelectWatchlist = () => {
                                this.onSelectWatchlist(val.id);
                              };
                              return (
                                <div
                                  key={idx}
                                  className={styles.WatchlistItem}
                                  onClick={onSelectWatchlist}
                                >
                                  {val.name}
                                </div>
                              );
                            })
                          ) : (
                            <div className={styles.WatchlistEmpty}>
                              {t('No Watchlist')}
                            </div>
                          )}
                        </Dropdown>
                      </div>
                    )}
                  </div>

                  {!this.props.isInfoFunction && (
                    <div className={styles.CompanyName} title={companyName}>
                      {companyName}
                    </div>
                  )}
                  <div className={styles.SummaryTitle}>
                    {!this.props.isInfoFunction && (
                      <div className={styles.SubTitle}>{t('Summary')}</div>
                    )}
                    {this.props.isInfoFunction && (
                      <div className={styles.CompanyName} title={companyName}>
                        {companyName}
                      </div>
                    )}
                  </div>
                  <div className={styles.SummaryContent}>
                    <div className={styles.SubTitle}>{t('Last Price')}</div>
                    <div
                      className={classNames(styles.Content, priceClassRules())}
                    >
                      <span>
                        {priceFormatted(
                          this.localSymbolData.c,
                          this.localSymbolData.t
                        ) || 0}
                      </span>
                      <span>
                        {priceClassRules() === globalStyles.Up ||
                        priceClassRules() === globalStyles.Ceil ? (
                          <FaArrowUp size={10} />
                        ) : priceClassRules() === globalStyles.Down ||
                          priceClassRules() === globalStyles.Floor ? (
                          <FaArrowDown size={10} />
                        ) : (
                          <FaStop size={9} />
                        )}
                      </span>
                      <span>
                        {priceFormatted(
                          this.localSymbolData.ch,
                          this.localSymbolData.t
                        ) || 0}
                      </span>
                      <span>{`(${formatNumber(
                        this.localSymbolData && this.localSymbolData.ra,
                        2
                      )}%)`}</span>
                    </div>
                  </div>
                  <div className={styles.SummaryContent}>
                    <div className={styles.SubTitle}>{t('High/Low/Avg')}</div>
                    <div className={styles.Content}>
                      <span
                        className={classNames(
                          priceClassRules(this.localSymbolData.h)
                        )}
                      >
                        {priceFormatted(
                          this.localSymbolData.h,
                          this.localSymbolData.t
                        ) || 0}
                      </span>
                      <span className={styles.Separator}>|</span>
                      <span
                        className={classNames(
                          priceClassRules(this.localSymbolData.l)
                        )}
                      >
                        {priceFormatted(
                          this.localSymbolData.l,
                          this.localSymbolData.t
                        ) || 0}
                      </span>
                      <span className={styles.Separator}>|</span>
                      <span
                        className={classNames(
                          priceClassRules(this.localSymbolData.a)
                        )}
                      >
                        {priceFormatted(
                          this.localSymbolData.a,
                          this.localSymbolData.t
                        ) || 0}
                      </span>
                    </div>
                  </div>
                  <div className={styles.SummaryContent}>
                    <div className={styles.SubTitle}>{t('Volume/ Value')}</div>
                    <div className={styles.Content}>
                      <span>
                        {quantityFormatted(
                          this.localSymbolData.vo,
                          this.localSymbolData.t,
                          1
                        ) || 0}
                      </span>
                      <span className={styles.Separator}>|</span>
                      <span>
                        {this.localSymbolData.va &&
                        this.localSymbolData.va > 1000000
                          ? `${
                              tradingValueFormatted(this.localSymbolData?.va) ||
                              '0'
                            } ${t('mil')}`
                          : formatNumber(this.localSymbolData.va) || '0'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.SummaryContent}>
                    <div className={styles.SubTitle}>
                      {t('Avg Volume (10 days)')}
                    </div>
                    <div className={styles.Content}>
                      {quantityFormatted(
                        this.localSymbolData.av,
                        this.localSymbolData.t,
                        1
                      ) || 0}
                    </div>
                  </div>
                  {/* <div className={styles.SummaryContent}>
                    <div className={styles.SubTitle}>{t('Buy Up/ Sell Down Vol')}</div>
                    <div className={styles.Content}>
                      <span>{0}</span>
                      <span className={styles.Separator}>|</span>
                      <span>{0}</span>
                    </div>
                  </div> */}
                </div>
                <TabTable data={priceDepthTab} />
              </div>
              <div className={styles.QuoteSection}>
                <TabTable data={quotesTab} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  private getWatchList = (props?: ISymbolInfoProps) =>
    getWatchlist(props != null ? props : this.props);

  private onChartReady = () => console.log('TVChart ready');

  private onSelectWatchlist = (id: number) => {
    const { code } = this.props.currentSymbol;
    const watchlists = this.getWatchList();
    let watchlist = watchlists.find((val) => val.id === id);
    let noti: INotification;
    if (watchlist) {
      if (watchlist.data) {
        if (watchlist.data.includes(code)) {
          this.props.showNotification({
            type: ToastType.WARNING,
            title: 'Favorite list',
            content: 'EXISTING_STOCK_CODE_IN_FAVORITE_LIST',
            contentParams: { stockCode: code },
            time: new Date(),
          });
          return;
        } else {
          watchlist = { ...watchlist, data: [...watchlist.data, code] };
          noti = {
            type: ToastType.SUCCESS,
            title: 'Update Favorite List',
            content: 'DESTINATION_FAVORITE_LIST_UPDATE_NEW_SYMBOL',
            contentParams: {
              symbol: code,
              market: this.props.symbolList.map?.[code].m,
              watchlist: watchlist.name,
            },
            time: new Date(),
          };
        }
      } else {
        watchlist = { ...watchlist, data: [code] };
        noti = {
          type: ToastType.SUCCESS,
          title: 'Update Favorite List',
          content: 'DESTINATION_FAVORITE_LIST_UPDATE_NEW_SYMBOL',
          contentParams: {
            symbol: code,
            market: this.props.symbolList.map?.[code].m,
            watchlist: watchlist.name,
          },
          time: new Date(),
        };
      }
      this.props.updateWatchlist(watchlist, noti);
    }
  };
}

const mapStateToProps = (state: IState) => ({
  symbolList: state.symbolList,
  newSymbolData: state.newSymbolData,
  newIndexData: state.newIndexData,
  lang: state.lang,
  currentSymbol: state.currentSymbol,
  watchlist: state.watchlist,
  watchlistServer: state.watchlistServer,
  resetMarketDataTrigger: state.resetMarketDataTrigger,
  symbolInfoModal: state.symbolInfoModal,
});

const mapDispatchToProps = {
  showNotification,
  updateWatchlist,
  setCurrentSymbol,
};

const SymbolInfo = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(SymbolInfoComponent)
  ),
  Fallback,
  handleError
);

export default SymbolInfo;
