import * as React from 'react';
import * as classNames from 'classnames';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  Fallback,
  SheetData,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import { getRealizedPortfolio } from './action';
import { portfolioTab } from '../config';
import { withErrorBoundary } from 'react-error-boundary';

interface IRealizedPortfolioProps
  extends React.ClassAttributes<RealizedPortfolioComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly accountRealizedPortfolio: IState['accountRealizedPortfolio'];

  readonly getRealizedPortfolio: typeof getRealizedPortfolio;
}

class RealizedPortfolioComponent extends React.Component<
  IRealizedPortfolioProps
> {
  private localGridApi?: GridApi;
  constructor(props: IRealizedPortfolioProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.props.i18n.on('languageChanged', this.onChangeLang);

    if (this.props.selectedAccount != null) {
      this.props.getRealizedPortfolio({
        accountNo: this.props.selectedAccount.accountNumber,
      });
    }
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t, accountRealizedPortfolio } = this.props;
    const summary = accountRealizedPortfolio.data?.accountSummary;
    const lastRow = accountRealizedPortfolio.data?.closePositionList.reduce(
      (val, cur) => ({
        seriesID: 'TOTAL',
        tradingPL: val.tradingPL + cur.tradingPL,
      }),
      {
        seriesID: 'TOTAL',
        tradingPL: 0,
      }
    );
    const RenderItem = (
      <div className={styles.TabBoard}>
        <table className={styles.TabAccount}>
          <thead>
            <tr>
              <th>{t('Account No.')}</th>
              <th>{t('NAV')}</th>
              <th>{t('PP')}</th>
              <th>{t('Profit/Loss')}</th>
              <th>{t('Margin/Ratio')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <AccountDropdown isForm={true} />
              </td>
              <>
                <td>{formatNumber(summary?.netAssetValue)}</td>
                <td>{formatNumber(summary?.PP)}</td>
                <td className={this.fomatColorCell(lastRow?.tradingPL)}>
                  {formatNumber(lastRow?.tradingPL)}
                </td>
                <td>{formatNumber(summary?.marginRatio)}</td>
              </>
            </tr>
          </tbody>
        </table>
        <div className={styles.PortfolioData}>
          <SheetData
            columnDefs={config.getColumnDefsEquity()}
            rowData={accountRealizedPortfolio.data?.closePositionList}
            lastRowData={[lastRow !== undefined ? lastRow : {}]}
            status={accountRealizedPortfolio.status}
            // onRowClicked={this.onRowClicked}
            onGridReady={this.onGridReady}
            defaultColDef={config.DEFAULT_COL_DEF}
          />
        </div>
      </div>
    );

    return (
      <div className={styles.RealizedPortfolio}>
        <TabTable
          data={portfolioTab(
            AccountRoutes.REALIZED_PORTFOLIO,
            RenderItem,
            this.props.selectedAccount?.type
          )}
          onSelect={this.onSelect}
        />
      </div>
    );
  }

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private fomatColorCell = (sum?: number) =>
    classNames({
      [styles.Default]: !sum,
      [globalStyles.Up]: sum && sum > 0,
      [globalStyles.Down]: sum && sum < 0,
    });
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  accountRealizedPortfolio: state.accountRealizedPortfolio,
});

const mapDispatchToProps = {
  getRealizedPortfolio,
};

const RealizedPortfolio = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(RealizedPortfolioComponent)
    ),
    Fallback,
    handleError
  )
);

export default RealizedPortfolio;
