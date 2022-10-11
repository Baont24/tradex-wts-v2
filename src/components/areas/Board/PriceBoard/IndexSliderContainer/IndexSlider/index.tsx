import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Dropdown, Fallback } from 'components/common';
import { FaArrowDown, FaArrowUp, FaStop } from 'react-icons/fa';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import {
  IndexSliderState,
  RealtimeChannelDataType,
  SymbolType,
} from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import {
  formatDateToString,
  formatStringToDate,
  formatTimeToUTC,
} from 'utils/datetime';
import { formatNumber, handleError } from 'utils/common';
import { queryIndexData, subscribe, unsubscribe } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import IndexSliderChart from './IndexSliderChart';
import config from 'config';

export interface IIndexSliderProps
  extends React.ClassAttributes<IndexSlider>,
    WithNamespaces {
  readonly symbolList: IState['symbolList'];
  readonly indexList: IState['indexList'];
  readonly indexBoardData: IState['indexBoardData'];
  readonly newIndexData: IState['newIndexData'];
  readonly resetBoardDataTrigger: IState['resetBoardDataTrigger'];
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];
  readonly lang: IState['lang'];
  readonly index: INewSymbolData;
  readonly indexSliderState: IndexSliderState;
  readonly lastTradingDate: string | null;
  readonly config: IState['config'];

  readonly queryIndexData: typeof queryIndexData;
  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
}

export interface IIndexSliderState {
  readonly indexCode: string;
  readonly indexData: number[][];
}
class IndexSlider extends React.Component<
  IIndexSliderProps,
  IIndexSliderState
> {
  private localSelectedIndex?: INewSymbolData;
  private localReferencePrice: number | undefined;
  private localIndexName: string | undefined;
  private localSeconds: number;
  private localIndexListDropdown: Array<{
    readonly title: string;
    readonly value: string;
  }>;
  constructor(props: IIndexSliderProps) {
    super(props);

    this.state = {
      indexCode: props.index.s,
      indexData: [],
    };
    this.localSeconds = new Date().getSeconds();
    this.localReferencePrice = props.index.re;
    this.localSelectedIndex = props.index;
    this.localIndexName = props.index.n1;
    this.localIndexListDropdown = this.getIndexListDropdown(props.indexList);
  }

  shouldComponentUpdate(
    nextProps: IIndexSliderProps,
    nextState: IIndexSliderState
  ) {
    if (
      this.state.indexCode !== nextState.indexCode ||
      this.props.resetBoardDataTrigger !== nextProps.resetBoardDataTrigger ||
      this.props.symbolList !== nextProps.symbolList
    ) {
      this.props.queryIndexData({
        symbolList: [nextState.indexCode],
        indexType: 'chart',
      });

      const indexToUnsubscribe = this.props.symbolList.map?.[
        this.state.indexCode
      ];
      if (indexToUnsubscribe) {
        this.props.unsubscribe({
          symbolList: [indexToUnsubscribe],
          types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
          symbolType: SymbolType.INDEX,
        });
      }

      const indexToSubscribe = this.props.symbolList.map?.[nextState.indexCode];
      if (indexToSubscribe) {
        this.props.subscribe({
          symbolList: [indexToSubscribe],
          types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
          symbolType: SymbolType.INDEX,
        });

        this.localReferencePrice = indexToSubscribe.re;
        this.localIndexName = indexToSubscribe.n1;
      }

      this.localIndexListDropdown = this.getIndexListDropdown(
        nextProps.indexList
      );

      return true;
    }

    if (
      nextProps.indexBoardData &&
      nextProps.indexBoardData !== this.props.indexBoardData
    ) {
      const nextSelectedIndex = nextProps.indexBoardData.data.array.find(
        (val) => val.s === this.state.indexCode
      );
      if (nextSelectedIndex) {
        this.localSelectedIndex = nextSelectedIndex;
      }
      return true;
    }

    // Data from quote
    if (
      nextProps.newIndexData &&
      this.state.indexCode === nextProps.newIndexData.s
    ) {
      let currentSeconds = new Date().getSeconds();
      const secondChange = currentSeconds - this.localSeconds;
      if (
        secondChange >= nextProps.config.indexChartUpdateTime ||
        currentSeconds < this.localSeconds
      ) {
        this.localSeconds = currentSeconds;
        this.localSelectedIndex = {
          ...this.localSelectedIndex,
          ...nextProps.newIndexData,
          ic: this.localSelectedIndex?.ic
            ? { ...this.localSelectedIndex?.ic, ...nextProps.newIndexData.ic }
            : undefined,
        };
        return true;
      }
      return false;
    }

    if (
      this.props.indexSliderState !== nextProps.indexSliderState ||
      this.props.lang !== nextProps.lang
    ) {
      return true;
    }

    if (this.props.lastTradingDate !== nextProps.lastTradingDate) {
      return true;
    }

    return false;
  }

  render() {
    if (this.localSelectedIndex) {
      const { t } = this.props;
      const time = this.getTimeForChartData(this.localSelectedIndex.ti);
      let point: number[] = [];
      let volume: number[] = [];
      if (time !== 0) {
        point = [time, this.localSelectedIndex.c as number];
        volume = [time, this.localSelectedIndex.mv as number];
      }

      this.localReferencePrice = this.localSelectedIndex.re;

      return (
        <div className={styles.IndexSlider}>
          {/* Chart */}
          {this.props.indexSliderState === IndexSliderState.SHOW ? (
            <div className={styles.ChartContainer}>
              {this.localSelectedIndex.h !== undefined ? (
                <IndexSliderChart
                  referencePrice={this.localReferencePrice || 0}
                  point={point}
                  chartName={this.localSelectedIndex.s as string}
                  volume={volume}
                  channelType={this.localSelectedIndex.channelType}
                  lastTradingDate={this.props.lastTradingDate}
                  market={this.localSelectedIndex.m}
                />
              ) : (
                <IndexSliderChart
                  referencePrice={0}
                  point={[0, 0]}
                  chartName={'no-name'}
                  volume={[0, 0]}
                  channelType={undefined}
                  lastTradingDate={null}
                  market={this.localSelectedIndex.m}
                />
              )}
            </div>
          ) : null}
          {/* Index Info */}
          <div className={styles.Info}>
            <div className={styles.InfoIndexName}>
              <Dropdown
                data={this.localIndexListDropdown}
                activeItem={this.localSelectedIndex?.s || ''}
                placeholder={this.localIndexName}
                onSelect={this.onChangeIndexCode}
                className={
                  domainConfig[config.domain]
                    ?.indexSliderDropdownClassName as string
                }
              />
            </div>
            <p
              className={
                styles.InfoIndexPoint +
                ' Right ' +
                this.checkUpDownColor(this.localSelectedIndex)
              }
            >
              <span className={styles.IconCenter}>
                {(this.localSelectedIndex.ch as number) === 0 ? (
                  <FaStop />
                ) : (this.localSelectedIndex.ch as number) > 0 ? (
                  <FaArrowUp />
                ) : (
                  <FaArrowDown />
                )}
              </span>
              <span className={styles.InfoIndexTotalPoint}>
                {formatNumber(this.localSelectedIndex.c, 2)}
              </span>
              <span>
                <span>({formatNumber(this.localSelectedIndex.ch, 2)}</span>
                <span>{formatNumber(this.localSelectedIndex.ra, 2)}%)</span>
              </span>
            </p>
          </div>
          {/* Trading Info */}
          <div className={`${styles.SharesBil} d-flex`}>
            <p className={styles.Shares}>
              <span className={styles.SharesBilNumber}>
                {formatNumber(this.localSelectedIndex.vo)}
              </span>
              <span
                className={classNames(styles.SharesBilText, {
                  [styles.SharesBilTextVcsc]:
                    domainConfig[config.domain]?.changeColorSharesBilText,
                })}
              >
                {t('Shares')}
              </span>
            </p>
            <p className={styles.Bil}>
              <span className={styles.SharesBilNumber}>
                {formatNumber(this.localSelectedIndex.va, 3, 1000000000)}
              </span>
              <span
                className={classNames(styles.SharesBilText, {
                  [styles.SharesBilTextVcsc]:
                    domainConfig[config.domain]?.changeColorSharesBilText,
                })}
              >
                {t('Bil')}
              </span>
            </p>
          </div>
          {/* Stock Change Info */}
          <div
            className={`${styles.StockChange} d-flex justify-content-center`}
          >
            <div className={`d-flex`}>
              <p className={`${styles.IncreaseColor} d-flex`}>
                <span
                  className={`${styles.IconCenter}  ${styles.StockChangeIcon}`}
                >
                  <FaArrowUp />
                </span>
                <span className={styles.TotalStocks}>
                  {this.localSelectedIndex.ic
                    ? this.localSelectedIndex.ic.up || 0
                    : 0}
                </span>
                <span className={styles.CeilColor}>
                  {this.localSelectedIndex.ic
                    ? `(${this.localSelectedIndex.ic.ce})` || '(0)'
                    : '(0)'}
                </span>
              </p>
              <p className={`${styles.UnchangeColor} d-flex`}>
                <span
                  className={`${styles.IconCenter}  ${styles.StockChangeIcon}`}
                >
                  <FaStop />
                </span>
                <span>
                  {this.localSelectedIndex.ic
                    ? this.localSelectedIndex.ic.uc || 0
                    : 0}
                </span>
              </p>
              <p className={`${styles.DecreaseColor} d-flex`}>
                <span
                  className={`${styles.IconCenter}  ${styles.StockChangeIcon}`}
                >
                  <FaArrowDown />
                </span>
                <span className={styles.TotalStocks}>
                  {this.localSelectedIndex.ic
                    ? this.localSelectedIndex.ic.dw || 0
                    : 0}
                </span>
                <span className={styles.FloorColor}>
                  {this.localSelectedIndex.ic
                    ? `(${this.localSelectedIndex.ic.fl})` || '(0)'
                    : '(0)'}
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private checkUpDownColor(selectedIndex: INewSymbolData) {
    if ((selectedIndex.ch as number) > 0) {
      return styles.IncreaseColor;
    } else if ((selectedIndex.ch as number) === 0 || !selectedIndex.ch) {
      return styles.UnchangeColor;
    }
    return styles.DecreaseColor;
  }

  private onChangeIndexCode = (title: string, value: string) => {
    this.setState({
      indexCode: value,
    });
  };

  private getTimeForChartData(selectedIndexTime: string | undefined) {
    let time = 0;
    if (selectedIndexTime) {
      const now = new Date();
      const nowToString = formatDateToString(now, 'yyyyMMdd');
      const timeString = nowToString + selectedIndexTime;
      const timeDate = formatStringToDate(timeString, 'yyyyMMddhhmmss');
      time = formatTimeToUTC(timeDate, 7);
    }
    return time;
  }

  private getIndexListDropdown = (indexList: IState['indexList']) => {
    let dropdownData = indexList
      .filter((val) => val.it === 'D')
      .map((index) => ({
        title: index.n1 as string,
        value: index.s as string,
      }));

    if (domainConfig[config.domain]?.deleteIndexOnIndexList) {
      const localDropdownData = dropdownData.map((val) => {
        return { ...val, title: val.title.replace(/\-?Index/i, '') };
      });
      dropdownData = localDropdownData;
    }

    return dropdownData;
  };
}
const mapStateToProps = (state: IState) => {
  return {
    indexList: state.indexList,
    newIndexData: state.newIndexData,
    indexBoardData: state.indexBoardData,
    lang: state.lang,
    symbolList: state.symbolList,
    resetMarketDataTrigger: state.resetMarketDataTrigger,
    resetBoardDataTrigger: state.resetBoardDataTrigger,
    config: state.config,
  };
};

const mapDispatchToProps = {
  queryIndexData,
  subscribe,
  unsubscribe,
};

export default withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(IndexSlider)
  ),
  Fallback,
  handleError
);
