import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import {
  IMarketPutthroughAdvertiseResponse,
  IMarketPutthroughDealResponse,
} from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { Market, SellBuyType } from 'constants/enum';
import {
  QUERY_FETCH_COUNT,
  TIME_FORMAT_DISPLAY,
  TIME_FORMAT_INPUT,
} from 'constants/main';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import { formatTimeToDisplay } from 'utils/datetime';
import {
  getMarketPutthroughAdvertise,
  getMarketPutthroughDeal,
  subscribeMarketPutthroughAdvertise,
  subscribeMarketPutthroughDeal,
  unsubscribeMarketPutthroughAdvertise,
  unsubscribeMarketPutthroughDeal,
} from './actions';
import { withErrorBoundary } from 'react-error-boundary';

export interface IPutThroughBoardProps
  extends React.ClassAttributes<PutThroughBoardComponent>,
    WithNamespaces {
  readonly market?: Market;
  readonly putthroughDeal: IState['putthroughDeal'];
  readonly putthroughAdvertiseBid: IState['putthroughAdvertiseBid'];
  readonly putthroughAdvertiseAsk: IState['putthroughAdvertiseAsk'];
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];
  readonly resetBoardDataTrigger: IState['resetBoardDataTrigger'];

  readonly getMarketPutthroughDeal: typeof getMarketPutthroughDeal;
  readonly getMarketPutthroughAdvertise: typeof getMarketPutthroughAdvertise;
  readonly subscribeMarketPutthroughAdvertise: typeof subscribeMarketPutthroughAdvertise;
  readonly unsubscribeMarketPutthroughAdvertise: typeof unsubscribeMarketPutthroughAdvertise;
  readonly subscribeMarketPutthroughDeal: typeof subscribeMarketPutthroughDeal;
  readonly unsubscribeMarketPutthroughDeal: typeof unsubscribeMarketPutthroughDeal;
}

export interface IPutThroughBoardState {
  readonly offsetMatched: number;
  readonly offsetBid: number;
  readonly offsetAsk: number;
}

const LOAD_MORE_OFFSET = 100;

class PutThroughBoardComponent extends React.Component<
  IPutThroughBoardProps,
  IPutThroughBoardState
> {
  constructor(props: IPutThroughBoardProps) {
    super(props);

    this.state = {
      offsetMatched: 0,
      offsetBid: 0,
      offsetAsk: 0,
    };
  }

  componentDidMount() {
    if (this.props.market != null) {
      this.props.getMarketPutthroughDeal({ marketType: this.props.market });
      this.props.subscribeMarketPutthroughDeal({
        marketType: this.props.market,
      });
      this.props.getMarketPutthroughAdvertise({
        marketType: this.props.market,
        sellBuyType: SellBuyType.BUY,
      });
      this.props.getMarketPutthroughAdvertise({
        marketType: this.props.market,
        sellBuyType: SellBuyType.SELL,
      });
      this.props.subscribeMarketPutthroughAdvertise({
        marketType: this.props.market,
        sellBuyType: 'ALL',
      });
    }
  }

  componentDidUpdate(prevProps: IPutThroughBoardProps) {
    if (
      this.props.market !== prevProps.market ||
      this.props.resetBoardDataTrigger !== prevProps.resetBoardDataTrigger ||
      this.props.resetMarketDataTrigger !== prevProps.resetMarketDataTrigger
    ) {
      this.setState(
        {
          offsetAsk: 0,
          offsetBid: 0,
          offsetMatched: 0,
        },
        () => {
          if (this.props.market) {
            this.props.getMarketPutthroughDeal({
              marketType: this.props.market,
            });
            this.props.subscribeMarketPutthroughDeal({
              marketType: this.props.market,
            });
            this.props.getMarketPutthroughAdvertise({
              marketType: this.props.market,
              sellBuyType: SellBuyType.BUY,
            });
            this.props.getMarketPutthroughAdvertise({
              marketType: this.props.market,
              sellBuyType: SellBuyType.SELL,
            });
            this.props.subscribeMarketPutthroughAdvertise({
              marketType: this.props.market,
              sellBuyType: 'ALL',
            });
          }
        }
      );
    }
  }

  componentWillUnmount() {
    this.props.unsubscribeMarketPutthroughAdvertise();
    this.props.unsubscribeMarketPutthroughDeal();
  }

  render() {
    const {
      t,
      putthroughDeal,
      putthroughAdvertiseBid,
      putthroughAdvertiseAsk,
    } = this.props;
    return (
      <div className={styles.PutThroughBoard}>
        <div className={styles.TotalSection}>
          {`${t('TOTAL QUANTITY OF PUT THROUGH TRADING')}: ${formatNumber(
            putthroughDeal.data.total.tvo,
            2
          )} - ${t('TOTAL VALUE OF PUT THROUGH TRADING')}: ${formatNumber(
            putthroughDeal.data.total.tva,
            2
          )}`}
        </div>

        <div className={styles.BoardSection}>
          <div
            className={classNames(styles.Bid, styles.SubBoard)}
            onScroll={this.onScrollBid}
          >
            <div className={styles.Title}>
              <span>{t('Bid')}</span>
            </div>
            <div className={styles.PutThroughTable}>
              <div className={classNames(styles.Row, styles.HeaderRow)}>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Symbol')}
                </div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Price')}
                </div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Volume')}
                </div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Time')}
                </div>
              </div>
              {putthroughAdvertiseBid.data.length === 0
                ? !putthroughAdvertiseBid.status.isLoading && (
                    <div className={classNames(styles.Row, styles.EmptyRow)}>
                      <div className={styles.Cell}>{t('No Rows To Show')}</div>
                    </div>
                  )
                : putthroughAdvertiseBid.data.map((val, i) => (
                    <div key={i} className={styles.Row}>
                      <div
                        className={classNames(
                          styles.Cell,
                          this.putthroughAdvertiseClassRules(val)
                        )}
                      >
                        {val.s}
                      </div>
                      <div
                        className={classNames(
                          styles.Cell,
                          this.putthroughAdvertiseClassRules(val)
                        )}
                      >
                        {formatNumber(val.p, 2, 1000)}
                      </div>
                      <div className={styles.Cell}>
                        {formatNumber(val.v, 2)}
                      </div>
                      <div className={styles.Cell}>
                        {formatTimeToDisplay(
                          val.t,
                          TIME_FORMAT_DISPLAY,
                          TIME_FORMAT_INPUT
                        )}
                      </div>
                    </div>
                  ))}
              {putthroughAdvertiseBid.status.isLoading && (
                <div className={classNames(styles.Row, styles.EmptyRow)}>
                  <div className={styles.Cell}>{t('Loading Data')}</div>
                </div>
              )}
            </div>
          </div>

          <div
            className={classNames(styles.Matched, styles.SubBoard)}
            onScroll={this.onScrollMatched}
          >
            <div className={styles.Title}>
              <span>{t('Matched')}</span>
            </div>
            <div className={styles.PutThroughTable}>
              <div className={classNames(styles.Row, styles.HeaderRow)}>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Symbol')}
                </div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Price')}
                </div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Volume')}
                </div>
                <div
                  className={classNames(styles.HeaderCell, styles.Cell)}
                >{`${t('Value')} (${t('mils')})`}</div>
                <div
                  className={classNames(styles.HeaderCell, styles.Cell)}
                >{`${t('Accumulated Value')} (${t('mils')})`}</div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Time')}
                </div>
              </div>
              {putthroughDeal.data.list.length === 0
                ? !putthroughDeal.status.isLoading && (
                    <div className={classNames(styles.Row, styles.EmptyRow)}>
                      <div className={styles.Cell}>{t('No Rows To Show')}</div>
                    </div>
                  )
                : putthroughDeal.data.list.map((val, i) => (
                    <div key={i} className={styles.Row}>
                      <div
                        className={classNames(
                          styles.Cell,
                          this.putthroughDealClassRules(val)
                        )}
                      >
                        {val.s}
                      </div>
                      <div
                        className={classNames(
                          styles.Cell,
                          this.putthroughDealClassRules(val)
                        )}
                      >
                        {formatNumber(val.mp, 2, 1000)}
                      </div>
                      <div className={styles.Cell}>
                        {formatNumber(val.mvo, 2)}
                      </div>
                      <div className={styles.Cell}>
                        {formatNumber(val.mva, 2, 1000000)}
                      </div>
                      <div className={styles.Cell}>
                        {formatNumber(val.pva, 2, 1000000)}
                      </div>
                      <div className={styles.Cell}>
                        {formatTimeToDisplay(
                          val.t,
                          TIME_FORMAT_DISPLAY,
                          TIME_FORMAT_INPUT
                        )}
                      </div>
                    </div>
                  ))}
              {putthroughDeal.status.isLoading ? (
                <div className={classNames(styles.Row, styles.EmptyRow)}>
                  <div className={styles.Cell}>{t('Loading Data')}</div>
                </div>
              ) : (
                <div className={classNames(styles.Row, styles.FooterRow)}>
                  <div className={styles.Cell}>
                    {t('Price x 1000 VND, Value x 1000000 VND, Quantity x 1')}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={classNames(styles.Ask, styles.SubBoard)}
            onScroll={this.onScrollAsk}
          >
            <div className={styles.Title}>
              <span>{t('Ask')}</span>
            </div>
            <div className={styles.PutThroughTable}>
              <div className={classNames(styles.Row, styles.HeaderRow)}>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Symbol')}
                </div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Price')}
                </div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Volume')}
                </div>
                <div className={classNames(styles.HeaderCell, styles.Cell)}>
                  {t('Time')}
                </div>
              </div>
              {putthroughAdvertiseAsk.data.length === 0
                ? !putthroughAdvertiseAsk.status.isLoading && (
                    <div className={classNames(styles.Row, styles.EmptyRow)}>
                      <div className={styles.Cell}>{t('No Rows To Show')}</div>
                    </div>
                  )
                : putthroughAdvertiseAsk.data.map((val, i) => (
                    <div key={i} className={styles.Row}>
                      <div
                        className={classNames(
                          styles.Cell,
                          this.putthroughAdvertiseClassRules(val)
                        )}
                      >
                        {val.s}
                      </div>
                      <div
                        className={classNames(
                          styles.Cell,
                          this.putthroughAdvertiseClassRules(val)
                        )}
                      >
                        {formatNumber(val.p, 2, 1000)}
                      </div>
                      <div className={styles.Cell}>
                        {formatNumber(val.v, 2)}
                      </div>
                      <div className={styles.Cell}>
                        {formatTimeToDisplay(
                          val.t,
                          TIME_FORMAT_DISPLAY,
                          TIME_FORMAT_INPUT
                        )}
                      </div>
                    </div>
                  ))}
              {putthroughAdvertiseAsk.status.isLoading && (
                <div className={classNames(styles.Row, styles.EmptyRow)}>
                  <div className={styles.Cell}>{t('Loading Data')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  private onScrollMatched = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const currentPosition = Math.round(
      ((event.currentTarget.clientHeight + event.currentTarget.scrollTop) /
        event.currentTarget.scrollHeight) *
        100
    );
    if (
      currentPosition === LOAD_MORE_OFFSET &&
      !this.props.putthroughDeal.status.isLoading &&
      this.props.putthroughDeal.status.loadMore
    ) {
      this.setState(
        {
          offsetMatched: this.state.offsetMatched + QUERY_FETCH_COUNT,
        },
        () => {
          if (this.props.market != null) {
            this.props.getMarketPutthroughDeal({
              marketType: this.props.market,
              offset: this.state.offsetMatched,
            });
          }
        }
      );
    }
  };

  private onScrollAsk = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const currentPosition = Math.round(
      ((event.currentTarget.clientHeight + event.currentTarget.scrollTop) /
        event.currentTarget.scrollHeight) *
        100
    );
    if (
      currentPosition === LOAD_MORE_OFFSET &&
      !this.props.putthroughAdvertiseAsk.status.isLoading &&
      this.props.putthroughAdvertiseAsk.status.loadMore
    ) {
      this.setState(
        {
          offsetAsk: this.state.offsetAsk + QUERY_FETCH_COUNT,
        },
        () => {
          if (this.props.market != null) {
            this.props.getMarketPutthroughAdvertise({
              marketType: this.props.market,
              sellBuyType: SellBuyType.SELL,
              offset: this.state.offsetAsk,
            });
          }
        }
      );
    }
  };

  private onScrollBid = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const currentPosition = Math.round(
      ((event.currentTarget.clientHeight + event.currentTarget.scrollTop) /
        event.currentTarget.scrollHeight) *
        100
    );
    if (
      currentPosition === LOAD_MORE_OFFSET &&
      !this.props.putthroughAdvertiseBid.status.isLoading &&
      this.props.putthroughAdvertiseBid.status.loadMore
    ) {
      this.setState(
        {
          offsetBid: this.state.offsetBid + QUERY_FETCH_COUNT,
        },
        () => {
          if (this.props.market != null) {
            this.props.getMarketPutthroughAdvertise({
              marketType: this.props.market,
              sellBuyType: SellBuyType.BUY,
              offset: this.state.offsetBid,
            });
          }
        }
      );
    }
  };

  private putthroughDealClassRules = (data: IMarketPutthroughDealResponse) =>
    classNames({
      [globalStyles.Up]: data.re && data.mp > data.re,
      [globalStyles.Down]: data.re && data.mp < data.re,
      [globalStyles.Ref]: data.re && data.mp === data.re,
      [globalStyles.Ceil]: data.ce && data.mp === data.ce,
      [globalStyles.Floor]: data.fl && data.mp === data.fl,
    });

  private putthroughAdvertiseClassRules = (
    data: IMarketPutthroughAdvertiseResponse
  ) =>
    classNames({
      [globalStyles.Up]: data.re && data.p > data.re,
      [globalStyles.Down]: data.re && data.p < data.re,
      [globalStyles.Ref]: data.re && data.p === data.re,
      [globalStyles.Ceil]: data.ce && data.p === data.ce,
      [globalStyles.Floor]: data.fl && data.p === data.fl,
    });
}

const mapStateToProps = (state: IState) => ({
  putthroughDeal: state.putthroughDeal,
  putthroughAdvertiseBid: state.putthroughAdvertiseBid,
  putthroughAdvertiseAsk: state.putthroughAdvertiseAsk,
  resetMarketDataTrigger: state.resetMarketDataTrigger,
  resetBoardDataTrigger: state.resetBoardDataTrigger,
});

const mapDispatchToProps = {
  getMarketPutthroughDeal,
  getMarketPutthroughAdvertise,
  subscribeMarketPutthroughAdvertise,
  unsubscribeMarketPutthroughAdvertise,
  subscribeMarketPutthroughDeal,
  unsubscribeMarketPutthroughDeal,
};

const PutThroughBoard = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(PutThroughBoardComponent)
  ),
  Fallback,
  handleError
);

export default PutThroughBoard;
