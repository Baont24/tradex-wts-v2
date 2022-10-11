import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { Col, Row } from 'react-bootstrap';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import { getAssetInforDerivatives } from './actions';
import { withErrorBoundary } from 'react-error-boundary';
import config from 'config';

interface IAssetInforDerivativesProps
  extends React.ClassAttributes<AssetInforDerivativesComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly assetInforDerivatives: IState['assetInforDerivatives'];
  readonly isSmallComponent?: boolean;

  readonly getAssetInforDerivatives: typeof getAssetInforDerivatives;
}

class AssetInforDerivativesComponent extends React.Component<
  IAssetInforDerivativesProps
> {
  constructor(props: IAssetInforDerivativesProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (this.props.selectedAccount != null) {
      this.props.getAssetInforDerivatives({
        accountNo: this.props.selectedAccount.accountNumber,
      });
    }
  }

  shouldComponentUpdate(nextProps: IAssetInforDerivativesProps) {
    if (
      this.props.selectedAccount !== nextProps.selectedAccount &&
      nextProps.selectedAccount !== null
    ) {
      this.props.getAssetInforDerivatives({
        accountNo: nextProps.selectedAccount.accountNumber,
      });
    }
    return true;
  }

  render() {
    const { t, isSmallComponent } = this.props;
    const dataDerivatives = this.props.assetInforDerivatives.data;
    const derAccountSummary = dataDerivatives?.accountSummary;
    const derportfolio = dataDerivatives?.portfolioAssessment;
    const derCashInformation = dataDerivatives?.cashInformation;
    const derivativesAccountSummary = [
      {
        title1: 'Total Equity',
        value1: derAccountSummary?.totalEquity,
        title2: 'Floating/Trading P/L',
        value2: derAccountSummary?.floatingPL_tradingPL,
      },
      {
        title1: 'Account Balance',
        value1: derAccountSummary?.accountBalance,
        title2: 'Total P/L',
        value2: derAccountSummary?.totalPL,
      },
      {
        title1: 'Commision/Tax',
        value1: derAccountSummary?.commission_tax,
        title2: 'Min Reserv',
        value2: derAccountSummary?.minReserve,
      },
      {
        title1: 'Interest',
        value1: derAccountSummary?.interest,
        title2: 'Marginable',
        value2: derAccountSummary?.marginable,
      },
      {
        title1: 'Ext. Loan',
        value1: derAccountSummary?.extLoan,
        title2: 'RC Call',
        value2: derAccountSummary?.rcCall,
      },
      {
        title1: 'Delivery Amount',
        value1: derAccountSummary?.deliveryAmount,
        title2: 'Cash/Non-Cash',
        value2: derAccountSummary?.cash_nonCash,
      },
    ];
    const derivativesPortfolio = [
      {
        title: 'Initial Margin',
        value1: derportfolio?.internal.initialMargin,
        value2: 'colSpan',
      },
      {
        title: 'Spread Margin',
        value1: derportfolio?.internal.spreadMargin ?? '—',
        value2: derportfolio?.exchange.spreadMargin,
      },
      {
        title: 'Delivery Margin',
        value1: derportfolio?.internal.deliveryMargin,
        value2: derportfolio?.exchange.deliveryMargin ?? '—',
      },
      {
        title: 'Margin Req',
        value1: derportfolio?.internal.marginReq,
        value2: derportfolio?.exchange.marginReq,
      },
      {
        title: 'Account Ratio',
        value1: derportfolio?.internal.accountRatio,
        Value1BiggerZero:
          Number(derportfolio?.internal.accountRatio) >=
          Number(
            this.formatNumberHaveSlash(
              derportfolio?.internal.warning123,
              'left'
            )
          ),
        value2: derportfolio?.exchange.accountRatio,
        Value2BiggerZero:
          Number(derportfolio?.exchange.accountRatio) >=
          Number(
            this.formatNumberHaveSlash(
              derportfolio?.exchange.warning123,
              'left'
            )
          ),
      },
      {
        title: 'Warning 1/2/3',
        value1: derportfolio?.internal.warning123,
        value2: derportfolio?.exchange.warning123,
      },
      {
        title: 'Margin Call',
        value1: derportfolio?.internal.marginCall,
        value2: derportfolio?.exchange.marginCall,
      },
    ];
    const derivativesCashInfor = [
      {
        title: 'Cash',
        value1: derCashInformation?.internal.cash,
        value2: derCashInformation?.exchange.cash,
      },
      {
        title: 'Total Value',
        value1: derCashInformation?.internal.totalValue,
        value2: derCashInformation?.exchange.totalValue,
      },
      {
        title: 'Cash Withdrawable',
        value1: derCashInformation?.internal.cashWithdrawable,
        value2: derCashInformation?.exchange.cashWithdrawable,
      },
      {
        title: 'EE',
        value1: derCashInformation?.internal.EE,
        value2: derCashInformation?.exchange.EE,
      },
    ];

    return isSmallComponent ? (
      <div className={styles.TabAssetInformationDer}>
        <div
          className={`${styles.TableDerivatives} ${styles.CashBarSectionMini}`}
        >
          <div className={styles.body}>
            <p>{t('Net Aset Value')}</p>
            <p>{formatNumber(derAccountSummary?.totalEquity)}</p>
          </div>
          <div className={styles.body}>
            <p>{t('EE')}</p>
            <p>
              {this.foundMinEE(
                derCashInformation?.internal.EE,
                derCashInformation?.exchange.EE
              )}
            </p>
          </div>
          <div className={styles.body}>
            <p>{t('VSD Cash Withdrawable')}</p>
            <p>{formatNumber(derCashInformation?.exchange.cashWithdrawable)}</p>
          </div>
          <div className={styles.body}>
            <p>
              {t('Domain Cash WithDrawable', {
                domain: config.domain.toUpperCase(),
              })}
            </p>
            <p>{formatNumber(derCashInformation?.internal.cashWithdrawable)}</p>
          </div>
          <div className={styles.body}>
            <p>{t('Cash at VSD')}</p>
            <p>{formatNumber(derCashInformation?.exchange.cash)}</p>
          </div>
          <div className={styles.body}>
            <p>{t('Initial Margin')}</p>
            <p>{formatNumber(derportfolio?.internal.initialMargin)}</p>
          </div>
          <div className={styles.body}>
            <p>{t('Total Gain/loss')}</p>
            <p>{formatNumber(derAccountSummary?.totalPL)}</p>
          </div>
          <div className={styles.body}>
            <p>
              <i>{t('Unrealized Gain/Loss')}</i>
            </p>
            <p>
              {this.formatNumberHaveSlash(
                derAccountSummary?.floatingPL_tradingPL,
                'left'
              )}
            </p>
          </div>
          <div className={styles.body}>
            <p>
              <i>{t('Realized Gain/loss')}</i>
            </p>
            <p>
              {this.formatNumberHaveSlash(
                derAccountSummary?.floatingPL_tradingPL,
                'right'
              )}
            </p>
          </div>
          <div className={styles.body}>
            <p>{t('Commission')}</p>
            <p>
              {this.formatNumberHaveSlash(
                derAccountSummary?.commission_tax,
                'left'
              )}
            </p>
          </div>
          <div className={styles.body}>
            <p>{t('Tax + VSD Fee')}</p>
            <p>
              {this.formatNumberHaveSlash(
                derAccountSummary?.commission_tax,
                'right'
              )}
            </p>
          </div>
          <div className={styles.body}>
            <p>{t('Margin Requirement')}</p>
            <p>
              {this.foundMaxNumber(
                derportfolio?.internal.marginReq,
                derportfolio?.exchange.marginReq
              )}
            </p>
          </div>
          <div className={styles.body}>
            <p>{t('Account Ratio')}</p>
            <p>
              {this.foundMaxNumber(
                derportfolio?.internal.accountRatio,
                derportfolio?.exchange.accountRatio,
                3
              )}
              %
            </p>
          </div>
          <div className={styles.body}>
            <p>{t('Margin Call')}</p>
            <p>
              {this.foundMaxNumber(
                derportfolio?.internal.marginCall,
                derportfolio?.exchange.marginCall
              )}
            </p>
          </div>
        </div>
      </div>
    ) : (
      <div className={styles.TabAssetInformationDer}>
        <Row>
          <Col lg={7} sm={7} className="mt-3 pr-0">
            <div className={`${styles.TableDerivatives} ${styles.Summary}`}>
              <p>{t('Account Summary')}</p>
              {derivativesAccountSummary.map((item, index) => {
                return (
                  <div className={styles.body} key={index}>
                    <p
                      className={classNames({
                        [styles.OnBold]: item.title1 === 'Total Equity',
                      })}
                    >
                      {t(item.title1)}
                    </p>
                    <p
                      className={classNames({
                        [styles.OnBold]: item.title1 === 'Total Equity',
                      })}
                    >
                      {this.formatNumberHaveSlash(item.value1)}
                    </p>
                    <p>{t(item.title2)}</p>
                    <p>
                      {this.formatNumberHaveSlash(
                        item.value2,
                        undefined,
                        item.title2
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </Col>
          <Col lg={5} sm={5} className="mt-3 ">
            <div className={`${styles.TableDerivatives} ${styles.Porfolio}`}>
              <p>{t('Porfolio Assessment')}</p>
              <div className={styles.body}>
                <p />
                <p>
                  {t(
                    config.assetInfoFollowingDomain
                      ? config.assetInfoFollowingDomain
                      : 'Internal'
                  )}
                </p>
                <p>{t('Exchange')}</p>
              </div>
              {derivativesPortfolio.map((item, index) => {
                const checkValueBiggerZero = (value?: number | string) => {
                  return value !== undefined ? value > 0 : false;
                };
                return (
                  <div className={styles.body} key={index}>
                    <p>{t(item.title)}</p>
                    <p
                      className={classNames({
                        [globalStyles.Down]:
                          item.title === 'Margin Call' &&
                          checkValueBiggerZero(item.value1),
                        [globalStyles.Down]: item.Value1BiggerZero,
                      })}
                    >
                      {this.formatNumberCell(item.title, item.value1)}
                    </p>
                    {item.value2 !== 'colSpan' && (
                      <p
                        className={classNames({
                          [globalStyles.Down]:
                            item.title === 'Margin Call' &&
                            checkValueBiggerZero(item.value1),
                          [globalStyles.Down]: item.Value2BiggerZero,
                        })}
                      >
                        {this.formatNumberCell(item.title, item.value2)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
        <Row className="justify-content-end mt-3">
          <Col lg={5} sm={5}>
            <div className={`${styles.TableDerivatives} ${styles.Cash}`}>
              <p>{t('Cash Information')}</p>
              <div className={styles.body}>
                <p />
                <p>
                  {t(
                    config.assetInfoFollowingDomain
                      ? config.assetInfoFollowingDomain
                      : 'Internal'
                  )}
                </p>
                <p>{t('Exchange')}</p>
              </div>
              {derivativesCashInfor.map((item, index) => {
                return (
                  <div className={styles.body} key={index}>
                    <p>{t(item.title)}</p>
                    <p>{formatNumber(item.value1)}</p>
                    <p>{formatNumber(item.value2)}</p>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  private foundMinEE = (EeInternal?: number, EeExchange?: number) => {
    return formatNumber(Math.min(Number(EeInternal), Number(EeExchange)));
  };

  private foundMaxNumber = (
    Internal?: number,
    Exchange?: number,
    round?: number
  ) => {
    return formatNumber(Math.max(Number(Internal), Number(Exchange)), round);
  };

  private formatNumberCell = (title: String, value?: Number | String) => {
    return typeof value === 'string'
      ? value
      : title === 'Account Ratio'
      ? `${formatNumber(Number(value), 2, undefined, undefined, '--')} %`
      : formatNumber(Number(value), 2, undefined, undefined, '--');
  };

  private formatNumberHaveSlash = (
    val?: number | string,
    side?: string,
    title?: string
  ) => {
    if (typeof val === 'string' && val.indexOf('/')) {
      const locationSlash = val.indexOf('/');
      const stringCut = val.slice(0, locationSlash);
      if (side === 'left') {
        return formatNumber(Number(stringCut));
      }
      if (side === 'right') {
        return formatNumber(Number(val.slice(locationSlash + 1)));
      }
      if (title === 'Floating/Trading P/L') {
        return (
          <div>
            <span
              className={classNames({
                [globalStyles.Up]: Number(stringCut) > 0,
                [globalStyles.Down]: Number(stringCut) < 0,
              })}
            >
              {formatNumber(Number(stringCut))}
            </span>
            <span> / </span>
            <span
              className={classNames({
                [globalStyles.Up]: Number(val.slice(locationSlash + 1)) > 0,
                [globalStyles.Down]: Number(val.slice(locationSlash + 1)) < 0,
              })}
            >
              {formatNumber(Number(val.slice(locationSlash + 1)))}
            </span>
          </div>
        );
      }
      return `${formatNumber(Number(stringCut))} / ${formatNumber(
        Number(val.slice(locationSlash + 1))
      )}`;
    }
    if (title === 'Total P/L') {
      return (
        <span
          className={classNames({
            [globalStyles.Up]: Number(val) > 0,
            [globalStyles.Down]: Number(val) < 0,
          })}
        >
          {formatNumber(Number(val))}
        </span>
      );
    }
    return formatNumber(Number(val));
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  assetInforDerivatives: state.assetInforDerivatives,
});

const mapDispatchToProps = {
  getAssetInforDerivatives,
};

const AssetInforDerivatives = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(AssetInforDerivativesComponent)
    ),
    Fallback,
    handleError
  )
);

export default AssetInforDerivatives;
