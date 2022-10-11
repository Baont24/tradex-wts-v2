import './styles.scss';
import * as Highcharts from 'highcharts/highstock';
import * as React from 'react';
import { Fallback } from 'components/common';
import { IIndexMinutesData } from 'interfaces/common';
import { IParamsQueryIndexMinutes } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { RealtimeChannelDataType } from 'constants/enum';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatStringToDate, formatTimeToUTC } from 'utils/datetime';
import { getChartConfig } from './config';
import { handleError } from 'utils/common';
import { queryIndexMinutes } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import HighchartsReact from 'highcharts-react-official';

const timeToUpdateChart = 1;
const minOffset = 0.995;
const maxOffset = 1.005;

interface IChartRenderer extends Highcharts.SVGRenderer {
  url?: string; // eslint-disable-line
}

export interface IIndexSliderProps
  extends React.ClassAttributes<IndexSliderChart>,
    WithNamespaces,
    RouteComponentProps {
  readonly referencePrice: number;
  readonly point: number[];
  readonly chartName: string;
  readonly volume: number[];
  readonly indexMinutes: IIndexMinutesData;
  readonly channelType: RealtimeChannelDataType | undefined;
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];
  readonly resetBoardDataTrigger: IState['resetBoardDataTrigger'];
  readonly lastTradingDate: string | null;
  readonly market?: string;
  readonly queryIndexMinutes: (payload: IParamsQueryIndexMinutes) => void;
}

export interface IIndexSliderState {
  readonly chartOption: Highcharts.Options;
}

class IndexSliderChart extends React.Component<
  IIndexSliderProps,
  IIndexSliderState
> {
  private chartRef: React.RefObject<HighchartsReact>;
  private localTimeTemp: number;
  private localMax: number;
  private localMin: number;
  private localData: number[][] = [];
  private localIsQueryData = false;
  private localDate: Date;
  constructor(props: IIndexSliderProps) {
    super(props);

    this.state = {
      chartOption: getChartConfig(
        this.props.chartName,
        this.localData,
        this.localMax,
        this.localMin,
        this.props.referencePrice,
        undefined,
        this.localDate,
        this.props.market
      ),
    };

    this.chartRef = React.createRef();
  }

  shouldComponentUpdate(nextProps: IIndexSliderProps) {
    if (nextProps.chartName !== this.props.chartName) {
      this.localIsQueryData = true;
    }

    if (nextProps.referencePrice !== this.props.referencePrice) {
      this.localIsQueryData = true;
    }

    if (
      (this.localIsQueryData ||
        this.props.resetBoardDataTrigger !== nextProps.resetBoardDataTrigger) &&
      nextProps.lastTradingDate
    ) {
      this.localDate = formatStringToDate(
        nextProps.lastTradingDate,
        'yyyyMMdd'
      );
      this.props.queryIndexMinutes({
        symbol: nextProps.chartName,
        minuteUnit: timeToUpdateChart,
        fromTime: `${nextProps.lastTradingDate}020000`,
        toTime: `${nextProps.lastTradingDate}080000`,
        fetchCount: 1000,
      });

      this.refreshChartData();
      this.localIsQueryData = false;
      this.chartRef.current?.chart.update(
        getChartConfig(
          nextProps.chartName,
          [],
          this.localMax,
          this.localMin,
          nextProps.referencePrice,
          undefined,
          this.localDate,
          this.props.market
        )
      );
    }

    if (
      nextProps.indexMinutes.data &&
      nextProps.indexMinutes.data.t.length > 0 &&
      nextProps.indexMinutes.name === this.props.chartName &&
      nextProps.indexMinutes !== this.props.indexMinutes
    ) {
      const mutablePoints: number[][] = [];
      const mutableVolData: number[][] = [];
      nextProps.indexMinutes.data.t.forEach((point, i) => {
        const a = formatStringToDate(point, 'yyyyMMddhhmmss');
        const time = formatTimeToUTC(a, 7);
        if (nextProps.indexMinutes.data !== undefined) {
          mutablePoints.unshift([time, nextProps.indexMinutes.data.l[i]]);
          mutableVolData.unshift([time, nextProps.indexMinutes.data.pv[i]]);
        }
      });

      this.localData = mutablePoints;
      if (mutablePoints.length > 0) {
        this.localMax = mutablePoints[0][1];
        this.localMin = mutablePoints[0][1];
        this.localTimeTemp = mutablePoints[mutablePoints.length - 1][0];
        mutablePoints.forEach((point) => {
          if (point[1] > this.localMax) {
            this.localMax = point[1];
          }
          if (point[1] < this.localMin) {
            this.localMin = point[1];
          }
        });
      }

      this.refreshChartData();
      this.chartRef.current?.chart.update(
        getChartConfig(
          nextProps.chartName,
          this.localData,
          this.localMax,
          this.localMin,
          nextProps.referencePrice,
          mutableVolData,
          this.localDate,
          this.props.market
        )
      );
    }

    if (
      this.chartRef.current &&
      nextProps.point.length > 0 &&
      nextProps.referencePrice &&
      nextProps.volume.length > 0 &&
      nextProps.channelType === RealtimeChannelDataType.QUOTE
    ) {
      const chart = this.chartRef.current.chart;
      if (nextProps.point[1] > this.localMax || !this.localMax) {
        this.localMax = nextProps.point[1];
        if (this.localMax < nextProps.referencePrice) {
          this.localMax = nextProps.referencePrice;
        }
        chart.yAxis[0].update({ max: this.localMax * maxOffset });
      } else if (nextProps.point[1] < this.localMin || !this.localMin) {
        this.localMin = nextProps.point[1];
        if (this.localMin > nextProps.referencePrice) {
          this.localMin = nextProps.referencePrice;
        }
        chart.yAxis[0].update({ min: this.localMin * minOffset });
      }
      if (this.localTimeTemp === undefined) {
        this.localTimeTemp = nextProps.point[0];
      }
      const currentPointMin = new Date(this.localTimeTemp).getMinutes();
      const nextPointMin = new Date(nextProps.point[0]).getMinutes();
      const currentPointHour = new Date(this.localTimeTemp).getHours();
      const nextPointHour = new Date(nextProps.point[0]).getHours();
      const minChange = nextPointMin - currentPointMin;
      const hourChange = nextPointHour - currentPointHour;

      if (minChange >= timeToUpdateChart || hourChange !== 0) {
        this.localTimeTemp = nextProps.point[0];
        this.localData.push(nextProps.point);
        chart.series[0].addPoint(nextProps.point);
        chart.series[1].addPoint(nextProps.volume);
      } else {
        const length = chart.series[0].points.length;
        const volumeLength = chart.series[1].points.length;
        if (length > 0) {
          const lastIndex = this.localData.length - 1;
          chart.series[0].points[length - 1].update(nextProps.point);
          const lastVol = chart.series[1].points[volumeLength - 1]?.y;
          if (lastVol) {
            chart.series[1].points[volumeLength - 1].update([
              nextProps.volume[0],
              nextProps.volume[1] + lastVol,
            ]);
          }
          this.localData[lastIndex] = nextProps.point;
        }
      }
    }

    if (this.chartRef.current && this.props.match.url !== nextProps.match.url) {
      const url = new URL(this.props.match.url, window.location.origin).href;
      const newUrl = new URL(nextProps.match.url, window.location.origin).href;
      let elements = this.chartRef.current.chart.container.querySelectorAll(
        `[clip-path*="${url}"]`
      );
      elements = [].slice.call(elements);
      elements.forEach((el) => {
        const attr = el.getAttribute('clip-path');
        if (attr != null) {
          el.setAttribute('clip-path', attr.replace(url, newUrl));
        }
      });

      const mutableRenderer: IChartRenderer = this.chartRef.current.chart
        .renderer;
      mutableRenderer.url = newUrl;
      this.chartRef.current.chart.redraw();
    }

    return false;
  }

  render() {
    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={this.state.chartOption}
        allowChartUpdate={true}
        constructorType={'stockChart'}
        ref={this.chartRef}
      />
    );
  }

  private refreshChartData = () => {
    this.chartRef.current?.chart.series.forEach((chart) => {
      chart.setData([]);
    });
  };
}

const mapStateToProps = (state: IState) => ({
  indexMinutes: state.indexMinutes,
  resetMarketDataTrigger: state.resetMarketDataTrigger,
  resetBoardDataTrigger: state.resetBoardDataTrigger,
});

const mapDispatchToProps = {
  queryIndexMinutes,
};

export default withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(IndexSliderChart)
    ),
    Fallback,
    handleError
  )
);
