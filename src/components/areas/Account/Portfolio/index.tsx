import * as React from 'react';
import * as _ from 'lodash';
import * as classNames from 'classnames';
import * as configColumn from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  Fallback,
  SheetData,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { CellClickedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import { FaRegTimesCircle } from 'react-icons/fa';
import { FunctionKey, SystemType } from 'constants/enum';
import { IEquityEnquiryPortfolioAccountSummaryResponse } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { IWatchlist } from 'interfaces/common';
import { RouteComponentProps, withRouter } from 'react-router';
import { ToastType } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  addWatchlist,
  getServerWatchlist,
  setCurrentSymbol,
  updateWatchlist,
} from 'redux/global-actions';
import { changeSidebarFunction } from 'components/common/SideBarFunction/actions';
import { connect } from 'react-redux';
import { enquiryPortfolio } from 'components/common/OrderForm/actions';
import { formatNumber, handleError, multiplyBy1000 } from 'utils/common';
import { isAuthenticated } from 'utils/domain';
import { portfolioTab } from '../config';
import { request } from 'utils/socketApi';
import { withErrorBoundary } from 'react-error-boundary';
import config from 'config';

interface IAccountPortfolioProps
  extends React.ClassAttributes<PortfolioComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly accountList: IState['accountList'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly equityPortfolio: IState['equityPortfolio'];
  readonly derivativesPortfolio: IState['derivativesPortfolio'];
  readonly isSmallComponent?: boolean;
  readonly refresh?: boolean;
  readonly sideBarFunction?: IState['sideBarFunction'];
  readonly watchlist: IState['watchlist'];
  readonly watchlistServer: IState['watchlistServer'];

  readonly enquiryPortfolio: typeof enquiryPortfolio;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly changeSidebarFunction: typeof changeSidebarFunction;
  readonly addWatchlist: typeof addWatchlist;
  readonly updateWatchlist: typeof updateWatchlist;
  readonly getServerWatchlist: typeof getServerWatchlist;
}

class PortfolioComponent extends React.Component<IAccountPortfolioProps> {
  private localGridApi?: GridApi;
  constructor(props: IAccountPortfolioProps) {
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

  shouldComponentUpdate(nextProps: IAccountPortfolioProps) {
    if (
      this.props.selectedAccount !== nextProps.selectedAccount ||
      this.props.refresh !== nextProps.refresh ||
      (this.props.accountList !== nextProps.accountList &&
        nextProps.accountList.some((val) => val.isIICA))
    ) {
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
    const isIICA = selectedAccount?.isIICA;

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
      ? [
          {
            symbol: t('TOTAL 2'),
            value: equityPortfolio.data.total.value,
            unrealizedPLValue: equityPortfolio.data.total.unrealizedPLValue,
            marketValue: equityPortfolio.data.total.marketValue,
            unrealizedPLPercent: equityPortfolio.data.total.unrealizedPLPercent,
          },
        ]
      : undefined;

    const summary = isDerivatives
      ? derivativesPortfolio.data?.summary
      : equityPortfolio.data?.summary;
    const RenderItem = (
      <div className={styles.TabBoard}>
        <div className={styles.TabAccount}>
          {!this.props.isSmallComponent && (
            <table>
              <thead>
                <tr>
                  <th>{t('Account No.')}</th>
                  <th>{t('NAV')}</th>
                  <th>{t('PP')}</th>
                  {!isDerivatives && <th>{t('Market Value')}</th>}
                  <th>{t('Profit/Loss')}</th>
                  <th>{t('Margin/Ratio')}</th>
                  {this.props.selectedAccount?.isIICA && (
                    <th>{t('Total Asset')}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <AccountDropdown isForm={true} />
                  </td>
                  {isDerivatives ? (
                    <>
                      <td>{formatNumber(summary?.totalEquity)}</td>
                      <td>{formatNumber(derivativesPortfolio.data?.minPP)}</td>
                      <td
                        className={this.fomatColorCell(
                          derivativesPortfolio.data?.totalOpenPosition
                            ?.floatingPL
                        )}
                      >
                        {formatNumber(
                          derivativesPortfolio.data?.totalOpenPosition
                            ?.floatingPL
                        )}
                      </td>
                      <td>{derivativesPortfolio.data?.minAccountRatio}%</td>
                    </>
                  ) : (
                    <>
                      <td>
                        {isIICA
                          ? formatNumber(multiplyBy1000(summary?.netAssetValue))
                          : formatNumber(summary?.netAssetValue)}
                      </td>
                      <td>
                        {isIICA
                          ? formatNumber(multiplyBy1000(summary?.PP))
                          : formatNumber(summary?.PP)}
                      </td>
                      <td>
                        {formatNumber(equityPortfolio.data?.total?.marketValue)}
                      </td>
                      <td
                        className={this.fomatColorCell(
                          equityPortfolio.data?.total?.unrealizedPLValue
                        )}
                      >
                        {formatNumber(
                          equityPortfolio.data?.total?.unrealizedPLValue
                        )}
                      </td>
                      <td>
                        {
                          (summary as IEquityEnquiryPortfolioAccountSummaryResponse)
                            ?.marginRatio
                        }
                      </td>
                    </>
                  )}
                  {this.props.selectedAccount?.isIICA && (
                    <td>{formatNumber(multiplyBy1000(summary?.totalAsset))}</td>
                  )}
                </tr>
              </tbody>
            </table>
          )}
          {this.props.isSmallComponent && (
            <div className={styles.TabAccountMini}>
              <div>
                <p>{t('NAV')}</p>
                <p>
                  {isIICA && !isDerivatives
                    ? formatNumber(multiplyBy1000(summary?.netAssetValue))
                    : formatNumber(summary?.netAssetValue)}
                </p>
              </div>
              {!isDerivatives && (
                <div>
                  <p>{t('Market Val')}</p>
                  <p>
                    {formatNumber(equityPortfolio.data?.total?.marketValue)}
                  </p>
                </div>
              )}
              <div>
                <p>{t('P/L')}</p>
                {!isDerivatives && (
                  <p
                    className={this.fomatColorCell(
                      equityPortfolio.data?.total?.unrealizedPLValue
                    )}
                  >
                    {formatNumber(
                      equityPortfolio.data?.total?.unrealizedPLValue
                    )}
                  </p>
                )}
                {isDerivatives && (
                  <p
                    className={this.fomatColorCell(
                      derivativesPortfolio.data?.totalOpenPosition?.floatingPL
                    )}
                  >
                    {formatNumber(
                      derivativesPortfolio.data?.totalOpenPosition?.floatingPL
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            className={styles.ButtonCreateWatchlist}
            onClick={this.onAddPortfolioWatchlist}
          >
            <FaRegTimesCircle className={styles.Icon} />
            {t('Add To Watchlist')}
          </button>
        </div>
        <div className={styles.PortfolioData}>
          {isDerivatives ? (
            <SheetData
              columnDefs={
                this.props.isSmallComponent
                  ? configColumn.getColumnDefsDerivativesMini()
                  : configColumn.getColumnDefsDerivatives()
              }
              rowData={derivativesPortfolio.data?.openPositionList}
              lastRowData={lastRowData}
              status={derivativesPortfolio.status}
              onGridReady={this.onGridReady}
              defaultColDef={configColumn.DEFAULT_COL_DEF}
            />
          ) : (
            <SheetData
              columnDefs={
                this.props.isSmallComponent
                  ? configColumn.getColumnDefsEquityMini()
                  : configColumn.getColumnDefsEquity(this.onClickSymbol)
              }
              rowData={equityPortfolio.data?.portfolioList}
              lastRowData={lastRowData}
              status={equityPortfolio.status}
              hasGroupHeader={this.props.isSmallComponent ? false : true}
              onGridReady={this.onGridReady}
              defaultColDef={configColumn.DEFAULT_COL_DEF}
            />
          )}
        </div>
      </div>
    );

    return (
      <div className={styles.Portfolio}>
        <TabTable
          data={portfolioTab(
            AccountRoutes.PORTFOLIO,
            RenderItem,
            this.props.selectedAccount?.type
          )}
          onSelect={this.onSelect}
        />
      </div>
    );
  }

  private onAddPortfolioWatchlist = async () => {
    const PORTFOLIO_WATCHLIST = 'portfolio';
    let newName = 0;

    const watchlist = this.getWatchList();
    let isExist = true;

    while (isExist) {
      isExist = watchlist.some(
        (val) => val.name.trim() === PORTFOLIO_WATCHLIST + `_${newName}`
      );
      if (isExist) {
        newName = newName + 1;
      }
    }

    const name = PORTFOLIO_WATCHLIST + `_${newName}`;

    try {
      const response = await request(config.apis.addWatchList, { name: name });
      this.props.getServerWatchlist();

      let watchList = {
        id: (response.data as IWatchlist).id,
        name,
        data: [''],
        isServer: true,
      };

      const isDerivatives =
        this.props.selectedAccount?.type === SystemType.DERIVATIVES;
      const equityPortfolio = this.props.equityPortfolio.data
        ? this.props.equityPortfolio.data?.portfolioList.map(
            (val) => val.symbol
          )
        : [];
      const Derivatives = this.props.derivativesPortfolio.data
        ? this.props.derivativesPortfolio.data?.openPositionList.map(
            (val) => val.seriesID
          )
        : [];

      let codes: string[] = isDerivatives ? Derivatives : equityPortfolio;
      watchList = {
        ...watchList,
        data: codes,
      };

      this.props.updateWatchlist(watchList, {
        type: ToastType.SUCCESS,
        title: 'Add Symbol List Portfolio',
        content: 'DESTINATION_FAVORITE_LIST_ADD',
        contentParams: {},
        time: new Date(),
      });
    } catch (error) {
      console.log('Add watchlist', error);
    }
  };

  private getWatchList = (): IWatchlist[] =>
    isAuthenticated() ? this.props.watchlistServer : this.props.watchlist;

  private onClickSymbol = (data: CellClickedEvent) => {
    this.props.setCurrentSymbol({ code: data.value, forceUpdate: true });
    if (this.props.sideBarFunction?.footerKey !== FunctionKey.ORDER) {
      if (
        this.props.sideBarFunction?.key === FunctionKey.DASHBOARD ||
        this.props.sideBarFunction?.key == null
      ) {
        this.props.changeSidebarFunction({ key: FunctionKey.INFO });
      }
    }
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

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  equityPortfolio: state.equityPortfolio,
  derivativesPortfolio: state.derivativesPortfolio,
  accountOpenPositionItem: state.accountOpenPositionItem,
  accountList: state.accountList,
  sideBarFunction: state.sideBarFunction,
  watchlist: state.watchlist,
  watchlistServer: state.watchlistServer,
});

const mapDispatchToProps = {
  enquiryPortfolio,
  setCurrentSymbol,
  changeSidebarFunction,
  addWatchlist,
  updateWatchlist,
  getServerWatchlist,
};

const Portfolio = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(PortfolioComponent)
    ),
    Fallback,
    handleError
  )
);

export default Portfolio;
