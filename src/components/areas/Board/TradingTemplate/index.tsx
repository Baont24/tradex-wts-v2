import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { RealtimeChannelDataType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { subscribe, unsubscribe } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import BoardSection from './BoardSection';
import OrderBookSection from './OrderBookSection';
import OrderSection from './OrderSection';
import PortfolioSection from './PortfolioSection';

interface ITradingTemplateProps
  extends React.ClassAttributes<TradingTemplateComponent>,
    WithNamespaces {
  readonly currentSymbolData: IState['currentSymbolData'];

  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
}

interface ITradingTemplateState {
  readonly state?: boolean;
}

class TradingTemplateComponent extends React.Component<
  ITradingTemplateProps,
  ITradingTemplateState
> {
  constructor(props: ITradingTemplateProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (this.props.currentSymbolData != null) {
      this.props.subscribe({
        symbolList: [this.props.currentSymbolData],
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });
    }
  }

  componentDidUpdate(
    prevProps: ITradingTemplateProps,
    prevState: ITradingTemplateState
  ) {
    if (
      this.props.currentSymbolData !== prevProps.currentSymbolData &&
      this.props.currentSymbolData.s !== prevProps.currentSymbolData.s
    ) {
      this.props.unsubscribe({
        symbolList: [this.props.currentSymbolData],
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });
      this.props.subscribe({
        symbolList: [prevProps.currentSymbolData],
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });
    }
  }

  componentWillUnmount() {
    if (this.props.currentSymbolData != null) {
      this.props.unsubscribe({
        symbolList: [this.props.currentSymbolData],
        types: [
          RealtimeChannelDataType.QUOTE,
          RealtimeChannelDataType.BID_OFFER,
          RealtimeChannelDataType.EXTRA,
        ],
      });
    }
  }

  render() {
    return (
      <div className={styles.TradingTemplate}>
        <div className={styles.GridLayout}>
          <BoardSection />
          <OrderSection />
          <OrderBookSection />
          <PortfolioSection />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  currentSymbolData: state.currentSymbolData,
});

const mapDispatchToProps = {
  subscribe,
  unsubscribe,
};

const TradingTemplate = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(TradingTemplateComponent)
  ),
  Fallback,
  handleError
);

export default TradingTemplate;
