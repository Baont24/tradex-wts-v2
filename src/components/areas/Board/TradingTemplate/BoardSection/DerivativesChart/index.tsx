import * as Highcharts from 'highcharts/highstock';
import * as React from 'react';
import * as styles from '../styles.scss';
import * as utils from './utils';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { ISymbolQuote } from 'interfaces/market';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getChartConfig } from './config';
import { handleError } from 'utils/common';
import { queryAllSymbolDataQuote } from 'components/common/SymbolQuote/actions';
import {
  subscribeSymbolMobileServer,
  unsubscribeSymbolMobileServer,
} from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import HighchartsReact from 'highcharts-react-official';

interface IDerivativesChartProps
  extends React.ClassAttributes<DerivativesChartComponent>,
    WithNamespaces {
  readonly currentSymbolData: IState['currentSymbolData'];
  readonly symbolQuoteChart: IState['symbolQuoteChart'];
  readonly symbolQuoteSubscribedData: IState['symbolQuoteSubscribedData'];

  readonly queryAllSymbolDataQuote: typeof queryAllSymbolDataQuote;
  readonly subscribeSymbolMobileServer: typeof subscribeSymbolMobileServer;
  readonly unsubscribeSymbolMobileServer: typeof unsubscribeSymbolMobileServer;
}

interface IDerivativesChartState {
  readonly chartOptions?: Highcharts.Options;
}

class DerivativesChartComponent extends React.Component<
  IDerivativesChartProps,
  IDerivativesChartState
> {
  private chartRef: React.RefObject<HighchartsReact>;
  private containerRef: React.RefObject<HTMLDivElement>;
  private localSymbolQuoteCached: ISymbolQuote[];

  constructor(props: IDerivativesChartProps) {
    super(props);

    this.state = {};
    this.chartRef = React.createRef();
    this.containerRef = React.createRef();
    this.localSymbolQuoteCached = [];
  }

  componentDidMount() {
    this.props.queryAllSymbolDataQuote(this.props.currentSymbolData.s);
    this.props.subscribeSymbolMobileServer({
      symbolList: [this.props.currentSymbolData],
      types: [],
    });
  }

  shouldComponentUpdate(nextProps: IDerivativesChartProps) {
    if (
      this.props.symbolQuoteChart !== nextProps.symbolQuoteChart &&
      (nextProps.symbolQuoteChart.status.isSucceeded ||
        nextProps.symbolQuoteChart.status.isFailed)
    ) {
      this.chartRef.current?.chart.update(
        getChartConfig(this.props.currentSymbolData, new Date(), [
          ...this.localSymbolQuoteCached,
          ...nextProps.symbolQuoteChart.data.quotes[
            this.props.currentSymbolData.s
          ],
        ])
      );
      this.localSymbolQuoteCached = [];
    }

    if (
      this.props.currentSymbolData !== nextProps.currentSymbolData &&
      this.props.currentSymbolData.s !== nextProps.currentSymbolData.s
    ) {
      this.props.unsubscribeSymbolMobileServer({
        symbolList: [nextProps.currentSymbolData],
        types: [],
      });
      this.props.subscribeSymbolMobileServer({
        symbolList: [nextProps.currentSymbolData],
        types: [],
      });
      this.props.queryAllSymbolDataQuote(nextProps.currentSymbolData.s);
      this.chartRef.current?.chart.update(
        getChartConfig(nextProps.currentSymbolData, new Date(), [])
      );
    }

    if (
      this.props.symbolQuoteSubscribedData != null &&
      nextProps.symbolQuoteSubscribedData != null &&
      this.props.symbolQuoteSubscribedData[this.props.currentSymbolData.s] !==
        nextProps.symbolQuoteSubscribedData[this.props.currentSymbolData.s]
    ) {
      const symbolQuote =
        nextProps.symbolQuoteSubscribedData[this.props.currentSymbolData.s];
      if (
        this.props.symbolQuoteChart.status.isSucceeded ||
        this.props.symbolQuoteChart.status.isFailed
      ) {
        const { value, volume } = utils.getChartData(
          symbolQuote.c,
          symbolQuote.mv,
          symbolQuote.t
        );

        if (symbolQuote.t != null) {
          const points = this.chartRef.current?.chart.series[0].points;
          const latestPoint = points?.[points.length - 1];
          if (latestPoint != null && latestPoint.x < value[0]) {
            if (symbolQuote.c != null) {
              this.chartRef.current?.chart.series[0]?.addPoint(value);
            }
            if (symbolQuote.mv != null) {
              this.chartRef.current?.chart.series[1]?.addPoint(volume);
            }
          }
        }
      } else if (this.props.symbolQuoteChart.status.isLoading) {
        this.localSymbolQuoteCached = [
          symbolQuote,
          ...this.localSymbolQuoteCached,
        ];
      }
    }

    return false;
  }

  componentWillUnmount() {
    this.props.unsubscribeSymbolMobileServer({
      symbolList: [this.props.currentSymbolData],
      types: [],
    });
  }

  render() {
    return (
      <div className={styles.DerivativesChart} ref={this.containerRef}>
        <HighchartsReact
          highcharts={Highcharts}
          options={getChartConfig(
            this.props.currentSymbolData,
            new Date(),
            this.props.symbolQuoteChart.data.quotes[
              this.props.currentSymbolData.s
            ]
          )}
          constructorType={'stockChart'}
          ref={this.chartRef}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  currentSymbolData: state.currentSymbolData,
  symbolQuoteChart: state.symbolQuoteChart,
  symbolQuoteSubscribedData: state.symbolQuoteSubscribedData,
});

const mapDispatchToProps = {
  queryAllSymbolDataQuote,
  subscribeSymbolMobileServer,
  unsubscribeSymbolMobileServer,
};

const DerivativesChart = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(DerivativesChartComponent)
  ),
  Fallback,
  handleError
);

export default DerivativesChart;
