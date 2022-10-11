import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import { priceFormatted } from 'utils/board';
import { withErrorBoundary } from 'react-error-boundary';

interface ICurrentPriceFieldProps
  extends React.ClassAttributes<CurrentPriceFieldComponent>,
    WithNamespaces {
  readonly currentSymbol: IState['currentSymbol'];
  readonly currentSymbolData: IState['currentSymbolData'];

  readonly onClickPrice: (price?: number) => void;
}

class CurrentPriceFieldComponent extends React.Component<
  ICurrentPriceFieldProps
> {
  constructor(props: ICurrentPriceFieldProps) {
    super(props);
  }

  render() {
    const { t, currentSymbolData } = this.props;

    return currentSymbolData ? (
      <div className={styles.CurrentPriceField}>
        <span className="mr-1" onClick={this.onClickClosePrice}>
          <span className={styles.PriceTitle}>{`${t('Cur: 1')}: `}</span>
          <span
            className={classNames('text-nowrap', {
              [globalStyles.Up]:
                currentSymbolData.c &&
                currentSymbolData.re &&
                currentSymbolData.c > currentSymbolData.re,
              [globalStyles.Down]:
                currentSymbolData.c &&
                currentSymbolData.re &&
                currentSymbolData.c < currentSymbolData.re,
              [globalStyles.Ref]:
                currentSymbolData.c &&
                currentSymbolData.re &&
                currentSymbolData.c === currentSymbolData.re,
              [globalStyles.Ceil]: currentSymbolData.c === currentSymbolData.ce,
              [globalStyles.Floor]:
                currentSymbolData.c === currentSymbolData.fl,
              [globalStyles.Default]: !currentSymbolData.c,
            })}
          >
            {`${
              priceFormatted(currentSymbolData.c, currentSymbolData.t) || 0
            } (${formatNumber(currentSymbolData.ra, 2)}%)`}
          </span>
        </span>
        <span className="mr-1" onClick={this.onClickRefPrice}>
          <span className={styles.PriceTitle}>{`${t('Ref')}: `}</span>
          <span className={globalStyles.Ref}>
            {priceFormatted(currentSymbolData.re, currentSymbolData.t) || 0}
          </span>
        </span>
        <span className="mr-1" onClick={this.onClickCeilPrice}>
          <span className={styles.PriceTitle}>{`${t('Ceil')}: `}</span>
          <span className={globalStyles.Ceil}>
            {priceFormatted(currentSymbolData.ce, currentSymbolData.t) || 0}
          </span>
        </span>
        <span className="mr-1" onClick={this.onClickFloorPrice}>
          <span className={styles.PriceTitle}>{`${t('Floor')}: `}</span>
          <span className={globalStyles.Floor}>
            {priceFormatted(currentSymbolData.fl, currentSymbolData.t) || 0}
          </span>
        </span>
      </div>
    ) : null;
  }

  private onClickClosePrice = () => {
    this.props.onClickPrice(this.props.currentSymbolData?.c);
  };

  private onClickRefPrice = () => {
    this.props.onClickPrice(this.props.currentSymbolData?.re);
  };

  private onClickCeilPrice = () => {
    this.props.onClickPrice(this.props.currentSymbolData?.ce);
  };

  private onClickFloorPrice = () => {
    this.props.onClickPrice(this.props.currentSymbolData?.fl);
  };
}

const mapStateToProps = (state: IState) => ({
  currentSymbol: state.currentSymbol,
  currentSymbolData: state.currentSymbolData,
});

const mapDispatchToProps = {};

const CurrentPriceField = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(CurrentPriceFieldComponent)
  ),
  Fallback,
  handleError
);

export default CurrentPriceField;
