import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback, IndexBoard } from 'components/common';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { MAIN_INDEX_SHOW_COUNT } from 'constants/main';
import { PropType } from 'interfaces/common';
import { RealtimeChannelDataType, SymbolType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { queryIndexData, subscribe, unsubscribe } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';

export interface ISummaryIndexProps
  extends React.ClassAttributes<SummaryIndex>,
    WithNamespaces {
  readonly indexList: PropType<IState, 'indexList'>;
  readonly resetBoardDataTrigger: IState['resetBoardDataTrigger'];
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];

  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
  readonly queryIndexData: typeof queryIndexData;
}

export interface ISummaryIndexState {
  readonly tabKey: PropType<INewSymbolData, 'it'>;
  readonly localIndexList: INewSymbolData[] | [];
}

class SummaryIndex extends React.Component<
  ISummaryIndexProps,
  ISummaryIndexState
> {
  constructor(props: ISummaryIndexProps) {
    super(props);

    this.state = {
      tabKey: 'D',
      localIndexList: this.props.indexList
        .filter((val) => val.i && val.it === 'D')
        .slice(0, MAIN_INDEX_SHOW_COUNT),
    };
  }

  componentDidMount() {
    this.queryIndexData(this.state.localIndexList);
  }

  componentDidUpdate(
    prevProps: ISummaryIndexProps,
    prevState: ISummaryIndexState
  ) {
    if (
      prevState.tabKey !== this.state.tabKey ||
      prevProps.resetBoardDataTrigger !== this.props.resetBoardDataTrigger ||
      prevProps.indexList !== this.props.indexList
    ) {
      let indexList = this.props.indexList
        .filter((val) => val.i && val.it === this.state.tabKey)
        .slice(0, MAIN_INDEX_SHOW_COUNT);
      if (this.state.tabKey === 'F') {
        indexList = this.props.indexList.filter(
          (val) => val.it === this.state.tabKey
        );
        indexList = indexList
          .filter((val) => val.i)
          .concat(indexList.filter((val) => !val.i));
      }
      this.queryIndexData(indexList, this.state.localIndexList);
      this.setState({ localIndexList: indexList });
    }

    return true;
  }

  componentWillUnmount() {
    this.props.unsubscribe({
      symbolList: this.state.localIndexList,
      types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
      symbolType: SymbolType.INDEX,
    });
  }

  render() {
    return (
      <div className={styles.SummaryIndex}>
        <IndexBoard
          indexType="main-index-slider"
          indexListSlider={this.state.localIndexList}
          tabKey={this.state.tabKey}
          onSelectTab={this.onSelectTab}
          domLayout={this.state.tabKey === 'D'}
          rowHeight={22}
          headerHeight={22}
        />
      </div>
    );
  }

  private onSelectTab = (eventKey: PropType<INewSymbolData, 'it'>) => {
    this.setState({ tabKey: eventKey });
  };

  private queryIndexData = (
    indexList: INewSymbolData[],
    prevIndexList?: INewSymbolData[]
  ) => {
    if (indexList.length > 0) {
      this.props.queryIndexData({
        symbolList: indexList.map((el) => el.s),
        indexType: 'main-index-slider',
      });
      if (prevIndexList != null) {
        this.props.unsubscribe({
          symbolList: prevIndexList,
          types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
          symbolType: SymbolType.INDEX,
        });
      }

      this.props.subscribe({
        symbolList: indexList,
        types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
        symbolType: SymbolType.INDEX,
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  indexList: state.indexList,
  resetMarketDataTrigger: state.resetMarketDataTrigger,
  resetBoardDataTrigger: state.resetBoardDataTrigger,
  isDebugging: state.isDebugging,
});

const mapDispatchToProps = {
  subscribe,
  unsubscribe,
  queryIndexData,
};

export default withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(SummaryIndex)
  ),
  Fallback,
  handleError
);
