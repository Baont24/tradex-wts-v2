import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from '../styles.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { RealtimeChannelDataType, SymbolType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError, priceClassRules } from 'utils/common';
import { priceFormatted } from 'utils/board';
import { queryIndexData, subscribe, unsubscribe } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IIndexNavTabProps
  extends React.ClassAttributes<IndexNavTabComponent>,
    WithNamespaces {
  readonly indexList: IState['indexList'];
  readonly indexBoardRealtimeData: IState['indexBoardRealtimeData'];

  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
  readonly queryIndexData: typeof queryIndexData;
}

interface IIndexNavTabState {
  readonly indexList: IState['indexList'];
}

class IndexNavTabComponent extends React.Component<
  IIndexNavTabProps,
  IIndexNavTabState
> {
  constructor(props: IIndexNavTabProps) {
    super(props);

    this.state = {
      indexList: props.indexList
        .filter((index) => index.i && index.it === 'D')
        .slice(0, 5),
    };
  }

  componentDidMount() {
    this.props.queryIndexData({
      symbolList: this.state.indexList.map((val) => val.s),
      indexType: 'main-index-slider',
    });
    this.props.subscribe({
      symbolList: this.state.indexList,
      types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
      symbolType: SymbolType.INDEX,
    });
  }

  componentWillUnmount() {
    this.props.unsubscribe({
      symbolList: this.state.indexList,
      types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
      symbolType: SymbolType.INDEX,
    });
  }

  render() {
    return (
      <div className={styles.IndexNavTab}>
        {this.props.indexBoardRealtimeData.array
          .filter((index) => index.i && index.it === 'D')
          .slice(0, 5)
          .map((val, i) => (
            <span key={i}>
              <span>{`${val.s}: `}</span>
              <span className={priceClassRules(val.c, val)}>
                {priceFormatted(val.c, val.t) ?? '--'}
              </span>
              <div>
                <span
                  className={classNames(
                    styles.IndexChange,
                    priceClassRules(val.c, val)
                  )}
                >
                  {` ${val.ch != null && val.ch > 0 ? '+' : ''}${formatNumber(
                    val.ch,
                    2,
                    undefined,
                    undefined,
                    '--'
                  )} (${val.ra != null && val.ra > 0 ? '+' : ''}${formatNumber(
                    val.ra,
                    2
                  )}%)`}
                </span>
              </div>
            </span>
          ))}
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  indexList: state.indexList,
  indexBoardRealtimeData: state.indexBoardRealtimeData,
});

const mapDispatchToProps = {
  subscribe,
  unsubscribe,
  queryIndexData,
};

const IndexNavTab = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(IndexNavTabComponent)
  ),
  Fallback,
  handleError
);

export default IndexNavTab;
