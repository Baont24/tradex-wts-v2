import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { AccountType } from 'constants/enum';
import { Col, Row } from 'react-bootstrap';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import { getAssetInformation } from 'components/areas/Account/AssetInformation/AssetInforEquity/actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IAssetEquityTradingProps
  extends React.ClassAttributes<AssetEquityTradingComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly assetInformation: IState['assetInformation'];

  readonly getAssetInformation: typeof getAssetInformation;
}

class AssetEquityTradingComponent extends React.Component<
  IAssetEquityTradingProps
> {
  constructor(props: IAssetEquityTradingProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (this.props.selectedAccount != null) {
      this.props.getAssetInformation({
        accountNumber: this.props.selectedAccount.accountNumber,
      });
    }
  }

  shouldComponentUpdate(nextProps: IAssetEquityTradingProps) {
    if (
      this.props.selectedAccount !== nextProps.selectedAccount &&
      nextProps.selectedAccount !== null
    ) {
      this.props.getAssetInformation({
        accountNumber: nextProps.selectedAccount.accountNumber,
      });
    }
    return true;
  }

  render() {
    const { t, selectedAccount } = this.props;
    const { data } = this.props.assetInformation;
    const accountSummary = data?.accountSummary;
    const buyingPower = data?.buyingPower;
    const cashInformation = data?.cashInformation;
    const marginCallBy = data?.marginCallBy;
    const totalStockMarketValue = data?.total?.marketValue;
    return (
      <div className={classNames(styles.TabAssetInforTrading, 'm-2 mt-3')}>
        <Row>
          <Col lg={6} sm={6} className="pr-0">
            <div className={styles.TableSummary}>
              <table>
                <tbody>
                  <tr>
                    <td>{t('Net Asset Value')}</td>
                    <td>{formatNumber(accountSummary?.netAssetValue)}</td>
                  </tr>
                  <tr>
                    <td>{t('Total Stock Market Value')}</td>
                    <td>{formatNumber(totalStockMarketValue)}</td>
                  </tr>
                  <tr>
                    <td>{t('Purchasing Power')}</td>
                    <td>{formatNumber(buyingPower?.purchasingPower)}</td>
                  </tr>
                  <tr>
                    <td>{t('Cash Withdrawal')}</td>
                    <td>{formatNumber(cashInformation?.cashWithdrawal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
          <Col lg={6} sm={6} className="mb-3">
            <div className={styles.TableSummary}>
              <table>
                <tbody>
                  <tr>
                    <td>{t('Available advanced cash')}</td>
                    <td>
                      {formatNumber(cashInformation?.availableAdvancedCash)}
                    </td>
                  </tr>
                  {selectedAccount?.accountType === AccountType.MARGIN && (
                    <tr>
                      <td>{t('Margin Call')}</td>
                      <td>{formatNumber(marginCallBy?.marginCallByCash)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  assetInformation: state.assetInformation,
});

const mapDispatchToProps = {
  getAssetInformation,
};

const AssetEquityTrading = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(AssetEquityTradingComponent)
    ),
    Fallback,
    handleError
  )
);

export default AssetEquityTrading;
