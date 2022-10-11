import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Col, Row } from 'react-bootstrap';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import { getAssetInforDerivatives } from 'components/areas/Account/AssetInformation/AssetInforDerivatives/actions';
import { withErrorBoundary } from 'react-error-boundary';
import config from 'config';

interface IAssetInforDerTradingProps
  extends React.ClassAttributes<AssetInforDerTradingComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly assetInforDerivatives: IState['assetInforDerivatives'];

  readonly getAssetInforDerivatives: typeof getAssetInforDerivatives;
}

class AssetInforDerTradingComponent extends React.Component<
  IAssetInforDerTradingProps
> {
  constructor(props: IAssetInforDerTradingProps) {
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

  shouldComponentUpdate(nextProps: IAssetInforDerTradingProps) {
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
    const { t } = this.props;
    const dataDerivatives = this.props.assetInforDerivatives.data;
    const derAccountSummary = dataDerivatives?.accountSummary;
    const derportfolio = dataDerivatives?.portfolioAssessment;
    const derCashInformation = dataDerivatives?.cashInformation;

    const tableLeft = [
      {
        title: 'Net Asset Value',
        value: derAccountSummary?.totalEquity,
      },
      {
        title: 'EE',
        value: this.foundMinEE(
          derCashInformation?.internal.EE,
          derCashInformation?.exchange.EE
        ),
      },
      {
        title: 'VSD Cash Withdrawable',
        value: derCashInformation?.exchange.cashWithdrawable,
      },
      {
        title: 'Domain Cash Withdrawable',
        value: derCashInformation?.internal.cashWithdrawable,
        params: {
          domain: config.domain.toUpperCase(),
        },
      },
      {
        title: 'Cash at VSD',
        value: derCashInformation?.exchange.cash,
      },
      {
        title: 'Initial Margin',
        value: derportfolio?.internal.initialMargin,
      },
    ];

    return (
      <div className={classNames(styles.TabAssetInforDerTrading, 'm-2 mt-3')}>
        <Row>
          <Col lg={6} sm={6} className="pr-0">
            <div className={styles.TableSummary}>
              <table>
                <tbody>
                  {tableLeft.map((item, index) => (
                    <tr key={index}>
                      <td>{t(item.title, item.params)}</td>
                      <td>{formatNumber(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
          <Col lg={6} sm={6} className="mb-3">
            <div className={styles.TableSummary}>
              <table>
                <tbody>
                  <tr>
                    <td>{t('Total Gain/ Loss')}</td>
                    <td>{formatNumber(derAccountSummary?.totalPL)}</td>
                  </tr>
                  <tr>
                    <td className={styles.TextIndent}>
                      <i>{t('Unrealized Gain/Loss')}</i>
                    </td>
                    <td>
                      {this.formatNumberHaveSlash(
                        derAccountSummary?.floatingPL_tradingPL,
                        'left'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.TextIndent}>
                      <i>{t('Realized Gain/loss')}</i>
                    </td>
                    <td>
                      {this.formatNumberHaveSlash(
                        derAccountSummary?.floatingPL_tradingPL,
                        'right'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Commission')}</td>
                    <td>
                      {this.formatNumberHaveSlash(
                        derAccountSummary?.commission_tax,
                        'left'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Tax + VSD Fee')}</td>
                    <td>
                      {this.formatNumberHaveSlash(
                        derAccountSummary?.commission_tax,
                        'right'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Margin Requirement')}</td>
                    <td>
                      {this.foundMaxNumber(
                        derportfolio?.internal.marginReq,
                        derportfolio?.exchange.marginReq
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Account Ratio')}</td>
                    <td>
                      {this.foundMaxNumber(
                        derportfolio?.internal.accountRatio,
                        derportfolio?.exchange.accountRatio,
                        3
                      )}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td>{t('Margin Call')}</td>
                    <td>
                      {this.foundMaxNumber(
                        derportfolio?.internal.marginCall,
                        derportfolio?.exchange.marginCall
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  private foundMaxNumber = (
    Internal?: number,
    Exchange?: number,
    round?: number
  ) => {
    return formatNumber(Math.max(Number(Internal), Number(Exchange)), round);
  };

  private foundMinEE = (EeInternal?: number, EeExchange?: number) => {
    return Math.min(Number(EeInternal), Number(EeExchange));
  };

  private formatNumberHaveSlash = (val?: number | string, side?: string) => {
    if (typeof val === 'string' && val.indexOf('/')) {
      const locationSlash = val.indexOf('/');
      const stringCut = val.slice(0, locationSlash);
      if (side === 'left') {
        return formatNumber(Number(stringCut));
      }
      if (side === 'right') {
        return formatNumber(Number(val.slice(locationSlash + 1)));
      }
    }
    return '';
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  assetInforDerivatives: state.assetInforDerivatives,
});

const mapDispatchToProps = {
  getAssetInforDerivatives,
};

const AssetInforDerTrading = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(AssetInforDerTradingComponent)
    ),
    Fallback,
    handleError
  )
);

export default AssetInforDerTrading;
