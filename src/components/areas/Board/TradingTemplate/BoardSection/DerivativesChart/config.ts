import * as styles from '../styles.scss';
import * as utils from './utils';
import { IIndexSliderChartConfig } from 'interfaces/common';
import { INewSymbolData, ISymbolQuote } from 'interfaces/market';

const INDEXSLIDER_HIGHCHART_AREA_CONFIG: IIndexSliderChartConfig = {
  IncreaseColor: {
    line: '#00FC7D',
    gradient: [
      [0, 'rgba(38, 222, 129, 0.19) -5.15%'],
      [1, 'rgba(10, 14, 21, 0.22) 111.76%)'],
    ],
  },
  DecreaseColor: {
    line: '#EB3734',
    gradient: [
      [0, 'rgba(10, 14, 21, 0.1) 107.55%'],
      [1, 'rgba(235, 55, 52, 0.34) 25.43%'],
    ],
  },
};

const volumeColor = '#95BBEB';

export const getChartConfig = (
  symbol: INewSymbolData,
  date: Date,
  data?: ISymbolQuote[]
): Highcharts.Options => {
  const timeOpen = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    2
  );
  const timeClose = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    7,
    45
  );
  let values: Array<[number, number]> = [];
  let volumes: Array<[number, number]> = [];
  data?.forEach((quotes) => {
    if (quotes.t != null) {
      const { value, volume } = utils.getChartData(
        quotes.c,
        quotes.mv,
        quotes.t
      );
      if (quotes.c != null) {
        values = [value, ...values];
      }
      if (quotes.mv != null) {
        volumes = [volume, ...volumes];
      }
    }
  });
  values = [[timeOpen, symbol.re ?? 0], ...values];
  volumes = [[timeOpen, 0], ...volumes];
  console.log(`time`, values, volumes);

  return {
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    // Config chart
    chart: {
      // height,
      plotBackgroundColor: '#0A0E15',
      backgroundColor: '#1E2434',
      margin: [0, 0, 15, 0],
      type: 'area',
      zoomType: '' as never,
      animation: false,
      className: styles.FuturesChart,
    },
    plotOptions: {
      series: {
        enableMouseTracking: true,
        lineWidth: 1.2,
        shadow: false,
        color: INDEXSLIDER_HIGHCHART_AREA_CONFIG.IncreaseColor.line,
        pointPlacement: 'on',
        marker: {
          radius: 0,
        },
        animation: false,
      },
    },
    tooltip: {
      animation: false,
      enabled: true,
      shadow: false,
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255)',
      split: false,
      shared: true,
      dateTimeLabelFormats: {
        second: '%H:%M:%S',
      },
      style: {
        zIndex: 999,
      },
    },
    // X Axis
    xAxis: {
      ordinal: false,
      minPadding: 0,
      type: 'datetime',
      min: timeOpen,
      max: timeClose,
      tickInterval: 3600000,
      tickWidth: 0,
      lineColor: '#242631',
      gridLineWidth: 1,
      gridLineColor: '#333642',
      startOnTick: true,
      endOnTick: true,
      dateTimeLabelFormats: {
        hour: {
          main: '%Hh',
        },
      },
      labels: {
        style: {
          fontSize: '10px',
        },
        x: 0,
        y: 12,
      },
    },
    // Y Axis
    yAxis: [
      {
        min: symbol.fl,
        max: symbol.ce,
        endOnTick: false,
        startOnTick: false,
        gridLineWidth: 0,
        labels: {
          enabled: true,
        },
        plotLines: [
          {
            color: '#FF920F',
            width: 1,
            value: symbol.re,
            dashStyle: 'ShortDash',
            zIndex: 100,
          },
        ],
      },
      {
        endOnTick: true,
        startOnTick: true,
        opposite: true,
        gridLineWidth: 0,
        labels: {
          enabled: true,
        },
      },
    ],
    // Data
    series: [
      {
        type: 'line',
        name: 'Value',
        data: values,
        pointStart: 0,
        // enableMouseTracking: true,
        boostThreshold: 1,
        dataGrouping: {
          enabled: false,
        },
        threshold: symbol.re,
        negativeColor: INDEXSLIDER_HIGHCHART_AREA_CONFIG.DecreaseColor.line,
        negativeFillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: INDEXSLIDER_HIGHCHART_AREA_CONFIG.DecreaseColor.gradient,
        },
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: INDEXSLIDER_HIGHCHART_AREA_CONFIG.IncreaseColor.gradient,
        },
      },
      {
        type: 'column',
        name: 'Volume',
        data: volumes,
        // enableMouseTracking: true,
        max: 10000,
        boostThreshold: 1,
        yAxis: 1,
        color: volumeColor,
        zIndex: -1,
        grouping: false,
        fillColor: volumeColor,
        dataGrouping: {
          enabled: false,
        },
      },
    ],
    // Disable stock chart tool
    navigator: {
      enabled: false,
    },
    rangeSelector: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    time: {
      timezoneOffset: -7 * 60,
    },
    boost: {
      useGPUTranslations: true,
    },
  };
};
