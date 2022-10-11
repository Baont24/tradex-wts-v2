import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback, ScrollBar, SymbolSearch } from 'components/common';
import { IState } from 'redux/global-reducers';
import { ISymbolList } from 'interfaces/market';
import { PropType } from 'interfaces/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { setCurrentSymbol } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import SymbolInfo from 'components/common/SymbolInfo';

export interface IInfoFunctionProps
  extends React.ClassAttributes<InfoFunctionComponent>,
    WithNamespaces {
  readonly symbolList: ISymbolList;
  readonly newSymbolData: PropType<IState, 'newSymbolData'>;
  readonly currentSymbol: PropType<IState, 'currentSymbol'>;
  readonly addEventKeyDown?: () => void;
  readonly removeEventKeyDown?: () => void;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
}

class InfoFunctionComponent extends React.Component<IInfoFunctionProps> {
  constructor(props: IInfoFunctionProps) {
    super(props);
  }

  shouldComponentUpdate(nextProps: IInfoFunctionProps) {
    return true;
  }

  render() {
    const { t } = this.props;
    return (
      <ScrollBar autoHide={true}>
        <div className={styles.InfoFunction}>
          <div className={styles.SymbolPickerSection}>
            <SymbolSearch
              placeholder={t('Search Stock')}
              onSymbolSearch={this.onSymbolSearch}
              onBlurInput={this.onBlurInput}
              onFocusInput={this.onFocusInput}
            />
          </div>
          <SymbolInfo isInfoFunction={true} />
        </div>
      </ScrollBar>
    );
  }

  private onFocusInput = () => {
    this.props.removeEventKeyDown?.();
  };

  private onBlurInput = () => {
    this.props.addEventKeyDown?.();
  };

  private onSymbolSearch = (code: string, data?: string[]) => {
    const selectedSymbol = this.props.symbolList.map?.[code];
    if (selectedSymbol) {
      this.props.setCurrentSymbol({
        code: selectedSymbol.s,
        symbolType: selectedSymbol.t,
        forceUpdate: true,
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  symbolList: state.symbolList,
  newSymbolData: state.newSymbolData,
  lang: state.lang,
  currentSymbol: state.currentSymbol,
});

const mapDispatchToProps = {
  setCurrentSymbol,
};

const InfoFunction = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(InfoFunctionComponent)
  ),
  Fallback,
  handleError
);

export default InfoFunction;
