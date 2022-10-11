import * as React from 'react';
import * as styles from './styles.scss';
import { BlockUI, Fallback, TVChart, TabTable } from 'components/common';
import { IState } from 'redux/global-reducers';
import { ITabTableData } from 'interfaces/common';
import { SymbolType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import DerivativesChart from './DerivativesChart';
import IndexNavTab from './IndexNavTab';
import PriceBoardTT from './PriceBoardTT';

interface IBoardSectionProps
  extends React.ClassAttributes<BoardSectionComponent>,
    WithNamespaces {
  readonly lang: IState['lang'];
  readonly config: IState['config'];
  readonly currentSymbolData: IState['currentSymbolData'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly symbolQuoteChart: IState['symbolQuoteChart'];
}

interface IBoardSectionState {
  readonly eventKey: string;
}

class BoardSectionComponent extends React.Component<
  IBoardSectionProps,
  IBoardSectionState
> {
  constructor(props: IBoardSectionProps) {
    super(props);

    this.state = {
      eventKey: 'board',
    };
  }

  render() {
    const { t, config } = this.props;
    const tabs: ITabTableData[] = [
      {
        key: 'board',
        title: t('Board'),
        default: true,
        component: <PriceBoardTT />,
      },
      {
        key: 'chart',
        title: t('Chart'),
        component: (
          <TVChart
            onChartReady={this.onChartReady}
            locale={this.props.lang}
            timeFrames={config.tvTimeFrames}
            symbol={this.props.currentSymbolData.s}
            clientId={`tradex_${config.domain}`}
          />
        ),
      },
    ];

    return (
      <div className={styles.BoardSection}>
        <TabTable
          data={tabs}
          customNavTab={<IndexNavTab />}
          onSelect={this.onSelectTab}
        />
        {this.props.currentSymbolData.t === SymbolType.FUTURES &&
          this.state.eventKey === 'board' && (
            <BlockUI
              className={styles.DerivativesChartContainer}
              blocking={this.props.symbolQuoteChart.status.isLoading}
            >
              <DerivativesChart />
            </BlockUI>
          )}
      </div>
    );
  }

  private onSelectTab = (eventKey: string) => {
    this.setState({ eventKey });
  };

  private onChartReady = () => {
    return;
  };
}

const mapStateToProps = (state: IState) => ({
  lang: state.lang,
  config: state.config,
  currentSymbolData: state.currentSymbolData,
  selectedAccount: state.selectedAccount,
  symbolQuoteChart: state.symbolQuoteChart,
});

const mapDispatchToProps = {};

const BoardSection = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(BoardSectionComponent)
  ),
  Fallback,
  handleError
);

export default BoardSection;
