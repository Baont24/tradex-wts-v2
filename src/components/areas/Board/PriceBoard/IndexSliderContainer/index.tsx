import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { IndexSliderState } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getLastTradingDate } from 'redux/global-actions';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import IndexSlider from './IndexSlider';
import SummaryIndex from './SummaryIndex';
import classNames from 'classnames';

export interface IIndexSliderContainerProps
  extends React.ClassAttributes<IndexSliderContainer>,
    WithNamespaces {
  readonly indexSliderState: IndexSliderState;
  readonly indexSliderLength: number;
  readonly lastTradingDate: string | null;
  readonly indexList: INewSymbolData[];
  readonly getLastTradingDate: () => void;
}

class IndexSliderContainer extends React.Component<IIndexSliderContainerProps> {
  private localIndexData: INewSymbolData[] = [];

  constructor(props: IIndexSliderContainerProps) {
    super(props);

    this.localIndexData = props.indexList
      .filter((index) => index.i && index.it === 'D')
      .slice(0, props.indexSliderLength);
  }

  shouldComponentUpdate(nextProps: IIndexSliderContainerProps) {
    if (this.props.indexList !== nextProps.indexList) {
      this.localIndexData = nextProps.indexList
        .filter((index) => index.i && index.it === 'D')
        .slice(0, this.props.indexSliderLength);
    }

    return true;
  }

  render() {
    return (
      <div
        className={classNames(styles.IndexSliderContainer, {
          [styles.HideChart]:
            this.props.indexSliderState !== IndexSliderState.SHOW,
        })}
      >
        {this.localIndexData.length > 0 ? (
          this.localIndexData
            .slice(0, this.props.indexSliderLength)
            .map((index, i) => (
              <IndexSlider
                indexSliderState={this.props.indexSliderState}
                key={index.s}
                index={index}
                lastTradingDate={this.props.lastTradingDate}
              />
            ))
        ) : (
          <div className={styles.ErrorNotification}>
            <p>{this.props.t('No data')}</p>
          </div>
        )}
        {this.props.indexSliderState === IndexSliderState.SHOW &&
          this.localIndexData.length > 0 && <SummaryIndex />}
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  indexList: state.indexList,
  lastTradingDate: state.lastTradingDate,
});

const mapDispatchToProps = {
  getLastTradingDate,
};

export default withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(IndexSliderContainer)
  ),
  Fallback,
  handleError
);
