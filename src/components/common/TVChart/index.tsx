import * as React from 'react';
import * as style from './style.scss';
import { COLOR, Global, TV_CHART_DATA_STORAGE_KEY } from 'constants/main';
import {
  ChartData,
  ChartMetaInfo,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  LanguageCode,
  StudyTemplateData,
  StudyTemplateMetaInfo,
  widget,
} from './charting_library.min';
import { IError, IResponse } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { METHOD } from 'utils/METHOD';
import { QuoteData } from './datafeed-api';
import { Requester } from './datafeeds/requester';
import { SymbolType, WS } from 'constants/enum';
import { UDFCompatibleDatafeedBase } from './datafeeds/udf-compatible-datafeed-base';
import { connect } from 'react-redux';
import { getKey, setKey } from 'utils/localStorage';
import { handleError, isElectron } from 'utils/common';
import { setCurrentSymbol, subscribe, unsubscribe } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';

export enum ACTION_CHART {
  GET_ALL_CHARTS = 'GET_ALL_CHARTS',
  REMOVE_CHART = 'REMOVE_CHART',
  SAVE_CHART = 'SAVE_CHART',
  GET_CHART_CONTENT = 'GET_CHART_CONTENT',
}

export interface IChartProps {
  readonly symbol?: ChartingLibraryWidgetOptions['symbol'];
  readonly interval?: ChartingLibraryWidgetOptions['interval'];

  // BEWARE: no trailing slash is expected in feed URL
  readonly datafeedUrl: string;
  readonly libraryPath?: ChartingLibraryWidgetOptions['library_path'];
  readonly chartsStorageUrl?: ChartingLibraryWidgetOptions['charts_storage_url'];
  readonly chartsStorageApiVersion?: ChartingLibraryWidgetOptions['charts_storage_api_version'];
  readonly clientId?: ChartingLibraryWidgetOptions['client_id'];
  readonly userId?: ChartingLibraryWidgetOptions['user_id'];
  readonly fullscreen?: ChartingLibraryWidgetOptions['fullscreen'];
  readonly autosize?: ChartingLibraryWidgetOptions['autosize'];
  readonly studies_overrides?: ChartingLibraryWidgetOptions['studies_overrides'];
  readonly containerId?: ChartingLibraryWidgetOptions['container_id'];
  readonly timezone?: ChartingLibraryWidgetOptions['timezone'];
  readonly locale?: ChartingLibraryWidgetOptions['locale'];
  readonly timeFrames?: ITimeFrameConfig[];
  readonly style?: React.CSSProperties;
  readonly overrides?: ChartingLibraryWidgetOptions['overrides'];
}

interface ITimeFrameConfig {
  readonly text: string;
  readonly resolution: string;
  readonly titles?: { readonly [key: string]: string };
  readonly descs?: { readonly [key: string]: string };
}

const translateTimeFrames: (
  config: ITimeFrameConfig[] | undefined,
  locale: string | undefined
) => ChartingLibraryWidgetOptions['time_frames'] = (
  config: ITimeFrameConfig[] | undefined,
  language: string | undefined
) => {
  const locale = language || 'en';
  if (config == null || config.length === 0) {
    return undefined;
  }
  return config.map((timeFrame: ITimeFrameConfig) => {
    const title =
      timeFrame.titles != null ? timeFrame.titles[locale] : undefined;
    const description =
      timeFrame.descs != null ? timeFrame.descs[locale] : undefined;
    return {
      text: timeFrame.text,
      resolution: timeFrame.resolution,
      title,
      description,
    };
  });
};

export interface ITVChartProps
  extends React.ClassAttributes<TVChart>,
    IChartProps {
  readonly currentSymbol: IState['currentSymbol'];
  readonly lang: IState['lang'];
  readonly futuresList: IState['futuresList'];
  readonly symbolList: IState['symbolList'];
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];

  readonly onChartReady?: () => void;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
}

class TVChart extends React.Component<ITVChartProps> {
  static defaultProps: IChartProps = {
    symbol: 'AAA',
    interval: 'D',
    containerId: 'tv_chart_container',
    datafeedUrl: '/api/v2/tradingview/',
    libraryPath: `./charting_library/`,
    chartsStorageUrl: 'https://tradex.vn/rest/api/v1/tradingview', // 'https://tradex.vn/rest/api.json',
    chartsStorageApiVersion: '1.1',
    clientId: `tradex_${Global.config?.domain}`,
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    timezone: 'Asia/Bangkok',
    locale: 'en',
    timeFrames: undefined,
  };
  private localWidgetOptions: ChartingLibraryWidgetOptions | null = null;
  private localTVWidget: IChartingLibraryWidget | null = null;
  private datafeed: UDFCompatibleDatafeedBase = new UDFCompatibleDatafeedBase(
    this.props.datafeedUrl,
    {
      getQuotes: () =>
        new Promise<QuoteData[]>((resolve: Function, reject: Function) => {
          return;
        }),
    },
    new Requester(),
    this.props.subscribe,
    this.props.unsubscribe
  );
  private localIsReady = false;

  componentDidMount() {
    this.localWidgetOptions = {
      symbol: this.props.symbol as string,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: this.datafeed, // eslint-disable-line
      interval: this.props.interval as ChartingLibraryWidgetOptions['interval'],
      container_id: this.props
        .containerId as ChartingLibraryWidgetOptions['container_id'],
      library_path: this.props.libraryPath as string,
      custom_css_url: isElectron()
        ? '../custom.css'
        : '/charting_library/custom.css',
      locale: this.props.locale as ChartingLibraryWidgetOptions['locale'],
      disabled_features: ['border_around_the_chart'],
      enabled_features: [
        'study_templates',
        'side_toolbar_in_fullscreen_mode',
        'header_in_fullscreen_mode',
      ],
      charts_storage_url: this.props.chartsStorageUrl,
      charts_storage_api_version: this.props.chartsStorageApiVersion,
      client_id: this.props.clientId,
      user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      timezone: this.props.timezone,
      time_frames: translateTimeFrames(
        this.props.timeFrames,
        this.props.locale
      ),
      overrides: {
        'paneProperties.background': '#000',
        'paneProperties.topMargin': 1,
        'paneProperties.bottomMargin': 0,
        'scalesProperties.backgroundColor': '#000',
        'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
        'mainSeriesProperties.candleStyle.wickUpColor': COLOR.UP,
        'mainSeriesProperties.candleStyle.wickDownColor': COLOR.DOWN,
        'mainSeriesProperties.candleStyle.upColor': COLOR.UP,
        'mainSeriesProperties.candleStyle.downColor': COLOR.DOWN,
        'mainSeriesProperties.candleStyle.borderUpColor': COLOR.UP,
        'mainSeriesProperties.candleStyle.borderDownColor': COLOR.DOWN,
        'symbolWatermarkProperties.color': 'rgba(0, 0, 0, 0)',
      },
      studies_overrides: {
        'volume.volume.color.1': COLOR.UP,
        'volume.volume.color.0': COLOR.DOWN,
        'volume.volume.transparency': 200,
      },
      save_load_adapter: {
        getAllCharts: () => {
          return this.requestChartData(
            METHOD.GET,
            ACTION_CHART.GET_ALL_CHARTS,
            undefined,
            undefined,
            true
          );
        },
        removeChart: (chartId: string) => {
          return this.requestChartData(
            METHOD.DELETE,
            ACTION_CHART.REMOVE_CHART,
            chartId,
            undefined,
            true
          );
        },
        saveChart: (chartData: ChartData) => {
          return this.requestChartData(
            METHOD.POST,
            ACTION_CHART.SAVE_CHART,
            undefined,
            chartData,
            true
          );
        },
        getChartContent: (chartId: string) => {
          return this.requestChartData(
            METHOD.GET,
            ACTION_CHART.GET_CHART_CONTENT,
            chartId,
            undefined,
            true
          );
        },
        getAllStudyTemplates: () => Promise.resolve([]),

        removeStudyTemplate: (studyTemplateInfo: StudyTemplateMetaInfo) =>
          Promise.resolve(),

        saveStudyTemplate: (studyTemplateData: StudyTemplateData) =>
          Promise.resolve(),

        getStudyTemplateContent: (studyTemplateInfo: StudyTemplateMetaInfo) =>
          Promise.resolve(studyTemplateInfo.name),
      },
      theme: 'Dark',
    };

    const tvWidget = new widget(this.localWidgetOptions);
    this.localTVWidget = tvWidget;

    this.datafeed.initPromise
      .then((result: boolean) => {
        if (result === false) {
          if (this.props.onChartReady) {
            this.props.onChartReady();
          }

          this.localIsReady = true;
        }
      })
      .catch((err) => {
        console.error(err);
      });

    tvWidget.onChartReady(() => {
      if (this.props.onChartReady) {
        this.props.onChartReady();
      }

      this.localIsReady = true;
      const currentSymbol = this.props.currentSymbol.code;
      if (tvWidget.chart().symbol() !== currentSymbol) {
        tvWidget.setSymbol(currentSymbol, tvWidget.chart().resolution(), () =>
          console.log('Finish setting symbol', currentSymbol)
        );
      }

      tvWidget
        .chart()
        .onSymbolChanged()
        .subscribe(null, () => {
          const symbolExt = tvWidget.chart().symbolExt();
          if (this.props.setCurrentSymbol) {
            if (this.props.currentSymbol.code !== symbolExt.symbol) {
              let code = symbolExt.symbol;
              if (
                symbolExt.type === SymbolType.FUTURES &&
                this.props.symbolList.map?.[symbolExt.symbol] == null
              ) {
                const futures = this.props.futuresList.find(
                  (val) => val.r === symbolExt.symbol
                );
                if (futures != null) {
                  code = futures.s;
                }
              }
              this.props.setCurrentSymbol({
                code,
                refCode: symbolExt.symbol,
                symbolType: symbolExt.type as SymbolType,
                forceUpdate: true,
              });
            }
          }
        });
    });
  }

  shouldComponentUpdate(nextProps: ITVChartProps) {
    if (this.localTVWidget != null) {
      if (
        nextProps.currentSymbol.code !== this.props.currentSymbol.code &&
        this.localIsReady
      ) {
        this.localTVWidget.setSymbol(
          nextProps.currentSymbol.refCode || nextProps.currentSymbol.code || '',
          this.localTVWidget.chart().resolution(),
          () =>
            console.log('Finish setting symbol', nextProps.currentSymbol.code)
        );
      } else if (nextProps.locale !== this.props.locale) {
        this.localWidgetOptions = {
          ...(this.localWidgetOptions as ChartingLibraryWidgetOptions),
          locale: nextProps.locale as LanguageCode,
          symbol: this.props.currentSymbol.code as string,
          time_frames: translateTimeFrames(
            this.props.timeFrames,
            nextProps.locale
          ),
        };
        const tvWidget = new widget(this.localWidgetOptions);
        this.localTVWidget = tvWidget;

        tvWidget.onChartReady(() => {
          tvWidget
            .chart()
            .onSymbolChanged()
            .subscribe(null, () => {
              const symbolExt = tvWidget.chart().symbolExt();
              if (this.props.setCurrentSymbol) {
                if (this.props.currentSymbol.code !== symbolExt.symbol) {
                  let code = symbolExt.symbol;
                  if (
                    symbolExt.type === SymbolType.FUTURES &&
                    this.props.symbolList.map?.[symbolExt.symbol] == null
                  ) {
                    const futures = this.props.futuresList.find(
                      (val) => val.r === symbolExt.symbol
                    );
                    if (futures != null) {
                      code = futures.s;
                    }
                  }
                  this.props.setCurrentSymbol({
                    code,
                    refCode: symbolExt.symbol,
                    symbolType: symbolExt.type as SymbolType,
                    forceUpdate: true,
                  });
                }
              }
            });
        });
      }
    }

    if (
      this.props.resetMarketDataTrigger !== nextProps.resetMarketDataTrigger
    ) {
      this.localTVWidget?.chart().resetData();
    }

    return false;
  }

  componentWillUnmount() {
    try {
      if (this.localTVWidget != null) {
        this.localTVWidget.remove();
        this.localTVWidget = null;
        this.localIsReady = false;
      }
    } catch (error) {
      console.error('TVChart Unmount', error);
    }
  }

  render() {
    return (
      <div
        id={this.props.containerId}
        className={style.TVChart}
        style={this.props.style}
      />
    );
  }

  private requestChartData<T>(
    method: METHOD,
    action: ACTION_CHART,
    chartId?: string,
    chartData?: ChartData,
    saveLocal?: boolean
  ): Promise<T> {
    const socket = Global.sockets[WS.PRICE_BOARD];
    let param = {};
    if (action === ACTION_CHART.GET_ALL_CHARTS) {
      param = {
        client: 'tradex',
      };
    } else if (action === ACTION_CHART.REMOVE_CHART) {
      param = {
        client: 'tradex',
        chart: chartId,
      };
    } else if (action === ACTION_CHART.SAVE_CHART) {
      param = {
        client: 'tradex',
        ...chartData,
      };
    } else if (action === ACTION_CHART.GET_CHART_CONTENT) {
      param = {
        client: 'tradex',
        chart: chartId,
      };
    }

    const data = {
      uri: `${method}:/api/v2/tradingview/{version}/charts`,
      headers: {
        'accept-language': this.props.lang,
      },
      body: param,
    };
    return new Promise((resolve: Function, reject: Function) => {
      if (saveLocal) {
        const time = Math.round(Date.now() / 1000);
        const tvChartData = getKey<ChartData[]>(TV_CHART_DATA_STORAGE_KEY);
        if (action === ACTION_CHART.GET_ALL_CHARTS) {
          resolve(tvChartData);
        } else if (action === ACTION_CHART.REMOVE_CHART) {
          if (tvChartData) {
            setKey(
              TV_CHART_DATA_STORAGE_KEY,
              tvChartData.filter((val) => val.id !== chartId)
            );
            resolve(tvChartData);
          }
        } else if (action === ACTION_CHART.SAVE_CHART) {
          if (tvChartData) {
            if (chartData?.id != null) {
              setKey(
                TV_CHART_DATA_STORAGE_KEY,
                tvChartData.map((val) =>
                  val.id === chartData.id
                    ? { ...chartData, timestamp: time }
                    : val
                )
              );
            } else {
              setKey(TV_CHART_DATA_STORAGE_KEY, [
                ...tvChartData,
                { ...chartData, id: time, timestamp: time },
              ]);
            }
          } else {
            setKey(TV_CHART_DATA_STORAGE_KEY, [
              { ...chartData, id: time, timestamp: time },
            ]);
          }
          resolve(chartData?.id || time);
        } else if (action === ACTION_CHART.GET_CHART_CONTENT) {
          if (tvChartData) {
            resolve(tvChartData.find((val) => val.id === chartId)?.content);
          }
        }
      } else {
        socket?.emit(
          'doQuery',
          data,
          (
            err: IError,
            responseData: IResponse<{
              data: { content: ChartMetaInfo[] };
              status: string;
            }>
          ) => {
            if (err) {
              reject(err);
            } else {
              if (responseData != null) {
                if (action === ACTION_CHART.GET_ALL_CHARTS) {
                  resolve(responseData.data.data);
                } else if (action === ACTION_CHART.REMOVE_CHART) {
                  resolve(responseData.data.status);
                } else if (action === ACTION_CHART.SAVE_CHART) {
                  resolve(responseData.data.status);
                } else if (action === ACTION_CHART.GET_CHART_CONTENT) {
                  resolve(responseData.data.data.content);
                }
              }
            }
          }
        );
      }
    });
  }
}

const mapStateToProps = (state: IState) => ({
  currentSymbol: state.currentSymbol,
  lang: state.lang,
  futuresList: state.futuresList,
  symbolList: state.symbolList,
  resetMarketDataTrigger: state.resetMarketDataTrigger,
});

const mapDispatchToProps = {
  setCurrentSymbol,
  subscribe,
  unsubscribe,
};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(TVChart),
  Fallback,
  handleError
);
