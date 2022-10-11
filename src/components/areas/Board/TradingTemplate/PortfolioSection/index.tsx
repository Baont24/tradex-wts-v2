import * as React from 'react';
import * as config from './config';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  Fallback,
  SheetData,
  TabTable,
} from 'components/common';
import { GridApi, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { IEquityEnquiryPortfolioBeanItemResponse } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { ITabTableData } from 'interfaces/common';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { enquiryPortfolio } from 'components/common/OrderForm/actions';
import { formatNumber, handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import AssetDerTrading from './AssetDerTrading';
import AssetEquityTrading from './AssetEquityTrading';

interface IPortfolioSectionProps
  extends React.ClassAttributes<PortfolioSectionComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly equityPortfolio: IState['equityPortfolio'];
  readonly derivativesPortfolio: IState['derivativesPortfolio'];

  readonly enquiryPortfolio: typeof enquiryPortfolio;
}

class PortfolioSectionComponent extends React.Component<
  IPortfolioSectionProps
> {
  private localGridApi?: GridApi;
  constructor(props: IPortfolioSectionProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.props.i18n.on('languageChanged', this.onChangeLang);
    if (this.props.selectedAccount != null) {
      this.props.enquiryPortfolio({
        accountNumber: this.props.selectedAccount.accountNumber,
        type: this.props.selectedAccount.type,
      });
    }
  }

  shouldComponentUpdate(nextProps: IPortfolioSectionProps) {
    if (this.props.selectedAccount !== nextProps.selectedAccount) {
      if (nextProps.selectedAccount !== null) {
        this.props.enquiryPortfolio({
          accountNumber: nextProps.selectedAccount.accountNumber,
          type: nextProps.selectedAccount.type,
        });
      }
    }

    if (
      this.props.derivativesPortfolio !== nextProps.derivativesPortfolio ||
      this.props.equityPortfolio !== nextProps.equityPortfolio
    ) {
      setTimeout(() => {
        this.localGridApi?.sizeColumnsToFit();
      });
    }

    return true;
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const {
      t,
      derivativesPortfolio,
      equityPortfolio,
      selectedAccount,
    } = this.props;
    const isDerivatives =
      this.props.selectedAccount?.type === SystemType.DERIVATIVES;
    const lastRowData = isDerivatives
      ? derivativesPortfolio.data?.totalOpenPosition
        ? [
            {
              seriesID: t('TOTAL 2'),
              ...derivativesPortfolio.data.totalOpenPosition,
            },
          ]
        : undefined
      : equityPortfolio.data?.total
      ? [{ symbol: t('TOTAL 2'), ...equityPortfolio.data.total }]
      : undefined;
    const summary = isDerivatives
      ? derivativesPortfolio.data?.summary
      : equityPortfolio.data?.summary;
    const renderItems = (
      <div className={styles.TabBoard}>
        <div className={styles.PortfolioFilter}>
          <div className={styles.PortfolioAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown isForm={true} />
          </div>
          <div className={styles.PortfolioDropdown}>
            <p>{t('NAV')}</p>
            {isDerivatives ? (
              <>
                <p>{formatNumber(summary?.netAssetValue)}</p>
              </>
            ) : (
              <>
                <p>{formatNumber(summary?.netAssetValue)}</p>
              </>
            )}
          </div>
        </div>
        <div className={styles.PortfolioData}>
          {isDerivatives ? (
            <SheetData
              columnDefs={config.getColumnDefsDerivatives()}
              rowData={derivativesPortfolio.data?.openPositionList}
              lastRowData={lastRowData}
              status={derivativesPortfolio.status}
              onRowClicked={this.onRowClicked}
              onGridReady={this.onGridReady}
              defaultColDef={config.DEFAULT_COL_DEF}
            />
          ) : (
            <SheetData
              columnDefs={config.getColumnDefsEquity()}
              rowData={equityPortfolio.data?.portfolioList}
              lastRowData={lastRowData}
              status={equityPortfolio.status}
              onRowClicked={this.onRowClicked}
              onGridReady={this.onGridReady}
              defaultColDef={config.DEFAULT_COL_DEF}
            />
          )}
        </div>
      </div>
    );
    const tabs: ITabTableData[] = [
      {
        key: 'portfolio',
        title: t('Portfolio'),
        default: true,
        component: renderItems,
      },
      {
        key: 'asset',
        title: t('Asset'),
        component:
          selectedAccount?.type === SystemType.EQUITY ? (
            <AssetEquityTrading />
          ) : (
            <AssetDerTrading />
          ),
      },
    ];

    return (
      <div className={styles.PortfolioSection}>
        <TabTable data={tabs} />
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

  private onRowClicked = (event: RowClickedEvent) => {
    const portfolioList = event.data as IEquityEnquiryPortfolioBeanItemResponse;
    this.setState({ portfolioList });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  equityPortfolio: state.equityPortfolio,
  derivativesPortfolio: state.derivativesPortfolio,
});

const mapDispatchToProps = {
  enquiryPortfolio,
};

const PortfolioSection = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(PortfolioSectionComponent)
  ),
  Fallback,
  handleError
);

export default PortfolioSection;
