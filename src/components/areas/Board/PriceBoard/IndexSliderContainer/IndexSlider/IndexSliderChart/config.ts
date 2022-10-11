import { IIndexSliderChartConfig } from 'interfaces/common';
import { domainConfig } from 'config/domain';
import config from 'config';

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

export function getChartConfig(
  chartName: string,
  data: number[][],
  max: number | undefined,
  min: number | undefined,
  ref: number,
  volData: number[][] = [[0, 0]],
  day: Date,
  market?: string
): Highcharts.Options {
  // Get xAxis max min by adding time zone offset
  let displayDate = new Date();
  if (day) {
    displayDate = day;
  }
  // Get time config for chart
  let startTimeConfig = [9, 0, 0];
  let endTimeConfig = [15, 0, 0];
  const timeConfig = getTimeConfig(market);
  if (timeConfig) {
    startTimeConfig = timeConfig.fromTime;
    endTimeConfig = timeConfig.toTime;
  }
  // const chartTime = new Date()
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const date = displayDate.getDate();
  let startTime = new Date(
    year,
    month,
    date,
    startTimeConfig[0],
    startTimeConfig[1]
  );
  let endTime = new Date(year, month, date, endTimeConfig[0], endTimeConfig[1]);
  let startBreak = new Date(year, month, date, 11, 30);
  let endBreak = new Date(year, month, date, 13, 0);
  const timezoneDelay = -startTime.getTimezoneOffset() * 60 * 1000;
  startTime = new Date(startTime.getTime() + timezoneDelay);
  endTime = new Date(endTime.getTime() + timezoneDelay);
  startBreak = new Date(startBreak.getTime() + timezoneDelay);
  endBreak = new Date(endBreak.getTime() + timezoneDelay);

  // Check if data is null
  let chartData = data;
  let minData = min || ref;
  let maxData = max || ref;
  let startData;
  startData = ref;
  if (minData >= ref) {
    minData = ref;
  }
  if (maxData <= ref) {
    maxData = ref;
  }
  chartData =
    data.length > 0
      ? [
          [startTime.getTime(), startData],
          [data[0][0], startData],
          ...data,
        ].reduce(
          (acc, curr) => {
            if (!acc.find((val) => val[0] === curr[0])) {
              // eslint-disable-next-line functional/immutable-data
              acc.push(curr);
            }
            return acc;
          },
          [chartData[0]]
        )
      : [[startTime.getTime(), ref]];

  const minValue = minData * 0.995;
  const maxValue = maxData * 1.005;

  // Return HighChart Option
  return {
    // Disable all text
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
      height: 95,
      plotBackgroundColor: '#0A0E15',
      backgroundColor: domainConfig[config.domain]?.changeBackgroundColorChart
        ? '#2d2d2d'
        : '#1E2434',
      margin: [0, 0, 15, 0],
      type: 'area',
      zoomType: undefined,
      animation: false,
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
      enabled: true,
      shadow: false,
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255)',
      split: false,
      shared: true,
      style: {
        zIndex: 999,
      },
    },
    // X Axis
    xAxis: {
      ordinal: false,
      minPadding: 0,
      type: 'datetime',
      min: startTime.getTime(),
      max: endTime.getTime(),
      tickInterval: 3600000,
      tickWidth: 0,
      lineColor: '#242631',
      gridLineWidth: 1,
      gridLineColor: '#333642',
      startOnTick: true,
      endOnTick: true,
      // break
      // breaks: [
      //   {
      //     from: startBreak.getTime(),
      //     to: endBreak.getTime(),
      //     repeat: 24 * 36e5,
      //   },
      // ],
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
        min: minValue,
        max: maxValue,
        endOnTick: false,
        startOnTick: false,
        gridLineWidth: 0,
        labels: {
          enabled: false,
        },
        plotLines: [
          {
            color: '#FF920F',
            width: 1,
            value: startData,
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
          enabled: false,
        },
      },
    ],
    // Data
    series: [
      {
        type: 'line',
        name: chartName,
        data: chartData,
        pointStart: 0,
        // enableMouseTracking: true,
        boostThreshold: 1,
        dataGrouping: {
          enabled: false,
        },
        threshold: startData,
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
        data: volData,
        // enableMouseTracking: true,
        max: 5000000,
        boostThreshold: 1,
        yAxis: 1,
        color: volumeColor,
        zIndex: -1,
        grouping: false,
        fillColor: volumeColor,
        pointWidth: 1,
        maxPointWidth: 1,
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
    boost: {
      useGPUTranslations: true,
    },
  };
}

function getTimeConfig(market?: string) {
  if (!market) {
    return;
  }
  const chartConfig = config.indexChartConfig;

  let timeConfigByMarket;
  if (chartConfig && market) {
    timeConfigByMarket = chartConfig.time[market];
  }
  return timeConfigByMarket;
}
