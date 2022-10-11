import * as React from 'react';
import * as styles from './styles.scss';
import { AccountRoutes, Routes } from 'constants/routes';
import {
  AccountSummary,
  ActiveOder,
  AssetInformation,
  CashAdvanced,
  CashStatement,
  CashTransfer,
  LoadDetail,
  OrderBook,
  OrderConfirmation,
  OrderHistory,
  Portfolio,
  PositionStatement,
  RealizedPortfolio,
  RightInfomation,
  RightSubscriptions,
  SecuritiesStatement,
  StockTransfer,
  StopOrderHistory,
} from 'components/areas/Account';
import { CommonRoute, Fallback, Layout } from 'components/common';
import { HelpSVG } from 'assets/svg';
import { IState } from 'redux/global-reducers';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Redirect, Route, Switch } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getRoute, handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface IAccountProps
  extends React.ClassAttributes<AccountComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly config: IState['config'];
  readonly isAuthenticated: IState['isAuthenticated'];
  readonly lang: IState['lang'];
}

class AccountComponent extends React.Component<IAccountProps> {
  constructor(props: IAccountProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { t, location, config, isAuthenticated, lang } = this.props;
    const route = Routes.ACCOUNT;
    const subRoute = location.pathname.replace(`/${route}/`, '');
    const { title } = getRoute(
      config.nav,
      route,
      subRoute,
      this.props.selectedAccount?.type,
      isAuthenticated
    );
    return (
      <Layout route={route}>
        <div className={styles.Account}>
          <div className={styles.AccountContent}>
            <div className={styles.AccountTitle}>
              <div className={styles.Title}>{t(title || '')}</div>
              <div className={styles.RightMenu}>
                <div className={styles.MenuItem}>
                  <Link to={`/${route}/${AccountRoutes.PORTFOLIO}`}>
                    {t('Portfolio 2')}
                  </Link>
                </div>
                <div className={styles.MenuItem}>
                  <Link to={`/${route}/${AccountRoutes.ORDER_BOOK}`}>
                    {t('Orders')}
                  </Link>
                </div>
                <div className={styles.MenuItem}>
                  <Link to={`/${route}/${AccountRoutes.ASSET_MANAGEMENT}`}>
                    {t('Asset Management')}
                  </Link>
                </div>
                <div className={styles.MenuItem}>
                  <a
                    target="_blank"
                    href={
                      config.companyInfo[config.domain]?.hyperlink?.userGuide[
                        lang
                      ] || '#'
                    }
                    rel="noreferrer"
                  >
                    <HelpSVG width={17} />
                    {t('Help')}
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.AccountData}>
              <Switch>
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}`}
                  component={AccountSummary}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.SUMMARY}`}
                  component={AccountSummary}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.PORTFOLIO}`}
                  component={Portfolio}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.SECURITIES_STATEMENT}`}
                  component={SecuritiesStatement}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.STOCK_TRANSFER}`}
                  component={StockTransfer}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.SECURITIES_STATEMENT}`}
                  component={SecuritiesStatement}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.POSITION_STATEMENT}`}
                  component={PositionStatement}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.ASSET_MANAGEMENT}`}
                  component={AssetInformation}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.CASH_STATEMENT}`}
                  component={CashStatement}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.ACTIVE_ORDER}`}
                  component={ActiveOder}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.ORDER_BOOK}`}
                  component={OrderBook}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.STOP_ORDER_HISTORY}`}
                  component={StopOrderHistory}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.ORDER_HISTORY}`}
                  component={OrderHistory}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.ORDER_CONFIRMATION}`}
                  component={OrderConfirmation}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.WITHDRAW_MONEY}`}
                  component={CashTransfer}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.CASH_TRANSFER_REQUEST}`}
                  component={CashTransfer}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.RIGHT_INFORMATION}`}
                  component={RightInfomation}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.RIGHTS_SUBSCRIPTIONS}`}
                  component={RightSubscriptions}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.CASH_IN_ADVANCED}`}
                  component={CashAdvanced}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.REALIZED_PORTFOLIO}`}
                  component={RealizedPortfolio}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${AccountRoutes.LOAN_DETAIL}`}
                  component={LoadDetail}
                />
                <Route>
                  <Redirect to={`/${route}`} />
                </Route>
              </Switch>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  config: state.config,
  isAuthenticated: state.isAuthenticated,
  lang: state.lang,
});

const mapDispatchToProps = {};

const Account = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(AccountComponent)
    ),
    Fallback,
    handleError
  )
);

export default Account;
