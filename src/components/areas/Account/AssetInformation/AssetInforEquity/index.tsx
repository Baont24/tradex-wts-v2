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
import { getAssetInformation } from './actions';
import { withErrorBoundary } from 'react-error-boundary';
import config from 'config';

interface IAssetInforEquityProps
  extends React.ClassAttributes<AssetInforEquityComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly assetInformation: IState['assetInformation'];
  readonly isSmallComponent?: boolean;

  readonly getAssetInformation: typeof getAssetInformation;
}

class AssetInforEquityComponent extends React.Component<
  IAssetInforEquityProps
> {
  constructor(props: IAssetInforEquityProps) {
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

  shouldComponentUpdate(nextProps: IAssetInforEquityProps) {
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
    const { t, isSmallComponent, selectedAccount } = this.props;
    const { data } = this.props.assetInformation;
    const accountSummary = data?.accountSummary;
    const buyingPower = data?.buyingPower;
    const cashInformation = data?.cashInformation;
    // const fee = data?.fee;
    const margin = data?.margin;
    const marginCallBy = data?.marginCallBy;
    const totalStockMarketValue = data?.total?.marketValue;
    const equityAccountSummary = [
      {
        title: 'Total Asset',
        value: formatNumber(
          Number(accountSummary?.totalAsset),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Total Stock Market Value',
        value: formatNumber(totalStockMarketValue, 0, undefined, false, '—'),
      },
      // {
      //   title: 'Cash Balance 2',
      //   value: formatNumber(Number(accountSummary?.cashBalance), 0, undefined, false, '—'),
      // },
      // {
      //   title: 'Loan',
      //   value: accountSummary?.loan ?? '—',
      // },
      // {
      //   title: 'Pending Cash Dividend, CW',
      //   value: accountSummary?.pendingCashDividendCW ?? '—',
      // },
      // {
      //   title: 'Net interest, fee',
      //   value: accountSummary?.netInterestFee ?? '—',
      // },
      {
        title: 'Net Asset Value',
        value: formatNumber(
          Number(accountSummary?.netAssetValue),
          0,
          undefined,
          false,
          '—'
        ),
      },
    ];

    const equityCashInformation = [
      {
        title: 'Cash Withdrawal',
        value: formatNumber(
          Number(cashInformation?.cashWithdrawal),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Pending approval for withdrawal',
        value: formatNumber(
          Number(cashInformation?.pendingApprovalForWithdrawal),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Hold for pending purchase T0',
        value: formatNumber(
          Number(cashInformation?.holdForPendingPurchaseT0),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Hold for executed purchase T0',
        value: formatNumber(
          Number(cashInformation?.holdForExecutedPurchaseT0),
          0,
          undefined,
          false,
          '—'
        ),
      },
      // {
      //   title: 'Executed purchase T1',
      //   value: cashInformation?.executedPurchaseT1 ?? '—',
      // },
      {
        title: 'Available advanced cash',
        value: formatNumber(
          Number(cashInformation?.availableAdvancedCash),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Sold T0',
        value: formatNumber(
          Number(cashInformation?.soldT0),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Sold T1',
        value: formatNumber(
          Number(cashInformation?.soldT1),
          0,
          undefined,
          false,
          '—'
        ),
      },
      // {
      //   title: 'Accured Credit Interest',
      //   value: cashInformation?.accuredCreditInterest ?? '—',
      // },
    ];

    const equityMargin = [
      {
        title: 'Fixed Loan',
        value: formatNumber(
          Number(margin?.fixedLoan),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Day Loan',
        value: formatNumber(Number(margin?.dayLoan), 0, undefined, false, '—'),
      },
      {
        title: 'Accured Debit Interest',
        value: formatNumber(
          Number(margin?.accuredDebitInterest),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'Stock main',
        value: formatNumber(
          Number(margin?.stockMain),
          0,
          undefined,
          false,
          '—'
        ),
      },
      {
        title: 'MAS_Equity',
        value: formatNumber(Number(margin?.equity), 0, undefined, false, '—'),
      },
      {
        title: 'Margin ratio (%)',
        value: margin?.marginRatio ?? '—',
      },
      {
        title: 'Maintenance ratio (%)',
        value: margin?.maintenanceRatio ?? '—',
      },
    ];
    if (config.hideMarginCall !== true) {
      // eslint-disable-next-line functional/immutable-data
      equityMargin.push({
        title: 'Margin call by stock main amt',
        value: formatNumber(
          marginCallBy?.marginCallByStockMainAmount,
          0,
          undefined,
          false,
          '—'
        ),
      });
      // eslint-disable-next-line functional/immutable-data
      equityMargin.push({
        title: 'Margin call by cash',
        value: formatNumber(
          marginCallBy?.marginCallByCash,
          0,
          undefined,
          false,
          '—'
        ),
      });
    }

    return isSmallComponent ? (
      <div className={styles.TabAccountMini}>
        <div>
          <p>{t('Net Asset Value')}</p>
          <p>
            {formatNumber(
              Number(accountSummary?.netAssetValue),
              0,
              undefined,
              false,
              '—'
            )}
          </p>
        </div>
        <div>
          <p>{t('Total Stock Market Value')}</p>
          <p>{formatNumber(totalStockMarketValue, 0, undefined, false, '—')}</p>
        </div>
        <div>
          <p>{t('Purchasing Power')}</p>
          <p>
            {formatNumber(
              Number(buyingPower?.purchasingPower),
              0,
              undefined,
              false,
              '—'
            )}
          </p>
        </div>
        {/* {selectedAccount?.accountType === AccountType.MARGIN && (
          <div>
            <p>{t('Non Purchasing Power')}</p>
            <p>{buyingPower?.nonMarginPurchasingPower ?? '—'}</p>
          </div>
        )} */}
        {/* <div>
          <p>{t('Cash Balance')}</p>
          <p>{formatNumber(Number(accountSummary?.cashBalance), 0, undefined, false, '—')}</p>
        </div> */}
        <div>
          <p>{t('Cash Withdrawal')}</p>
          <p>
            {formatNumber(
              Number(cashInformation?.cashWithdrawal),
              0,
              undefined,
              false,
              '—'
            )}
          </p>
        </div>
        <div>
          <p>{t('Available advanced cash')}</p>
          <p>
            {formatNumber(
              Number(cashInformation?.availableAdvancedCash),
              0,
              undefined,
              false,
              '—'
            )}
          </p>
        </div>
        {/* {selectedAccount?.accountType === AccountType.MARGIN && (
          <div>
            <p>{t('Loan')}</p>
            <p>{accountSummary?.loan ?? '—'}</p>
          </div>
        )} */}
        {selectedAccount?.accountType === AccountType.MARGIN && (
          <div>
            <p>{t('Margin Call')}</p>
            <p>
              {formatNumber(
                marginCallBy?.marginCallByCash,
                0,
                undefined,
                false,
                '—'
              )}
            </p>
          </div>
        )}
      </div>
    ) : (
      <div className={styles.TabAssetInforEquity}>
        <Row>
          <Col lg={4} sm={6} className="mt-3 pr-0">
            <div className={styles.TableSummary}>
              <table>
                <thead>
                  <tr>
                    <th colSpan={2}>{t('Account Summary')}</th>
                  </tr>
                </thead>
                <tbody>
                  {equityAccountSummary.map((item, index) => (
                    <tr key={index}>
                      <td
                        className={classNames({
                          [styles.OnBold]:
                            item.title === 'Total Asset' ||
                            item.title === 'Loan' ||
                            item.title === 'Net Asset Value',
                        })}
                      >
                        {t(item.title)}
                      </td>
                      <td
                        className={classNames({
                          [styles.OnBold]:
                            item.title === 'Total Asset' ||
                            item.title === 'Loan' ||
                            item.title === 'Net Asset Value',
                        })}
                      >
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <thead>
                  <tr>
                    <th colSpan={2}>{t('Buying Power')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* <tr>
                    <td>{t('Extra Credit')}</td>
                    <td>{buyingPower?.extraCredit ?? '—'}</td>
                  </tr> */}
                  {/* <tr>
                    <td>{t('Nonmargin Purchasing Power')}</td>
                    <td>{buyingPower?.nonMarginPurchasingPower ?? '—'}</td>
                  </tr> */}
                  <tr className={styles.borderRadius}>
                    <td className={styles.OnBold}>{t('Purchasing Power')}</td>
                    <td className={styles.OnBold}>
                      {formatNumber(
                        Number(buyingPower?.purchasingPower),
                        0,
                        undefined,
                        false,
                        '—'
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
          <Col lg={4} sm={6} className="mt-3 pl-3 pr-3">
            <div className={styles.TableSummary}>
              <table>
                <thead>
                  <tr>
                    <th colSpan={2}>{t('Cash Infomation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {equityCashInformation.map((item, index) => (
                    <tr key={index}>
                      <td>{t(item.title)}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
                {/* <thead>
                  <tr>
                    <th colSpan={2}>{t('Fee')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.borderRadius}>
                    <td>{t('Pending Fee')}</td>
                    <td>{fee?.pendingFee ?? '—'}</td>
                  </tr>
                </tbody> */}
              </table>
            </div>
          </Col>
          <Col lg={4} sm={6} className="mt-3 pl-0">
            <div className={styles.TableSummary}>
              <table>
                <thead>
                  <tr>
                    <th colSpan={2}>{t('Margin')}</th>
                  </tr>
                </thead>
                <tbody>
                  {equityMargin.map((item, index) => (
                    <tr key={index}>
                      <td>{t(item.title)}</td>
                      <td>
                        {item.value}
                        {item.title.indexOf('%') !== -1 && '%'}
                        {item.title.indexOf('rate') !== -1 && '%'}
                      </td>
                    </tr>
                  ))}
                  <tr className={styles.borderRadius}>
                    <td />
                    <td />
                  </tr>
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

const AssetInforEquity = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(AssetInforEquityComponent)
    ),
    Fallback,
    handleError
  )
);

export default AssetInforEquity;
