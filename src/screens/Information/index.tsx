import * as React from 'react';
import * as styles from './styles.scss';
import { CommonRoute, Fallback, Layout } from 'components/common';
import { IState } from 'redux/global-reducers';
import { InfoRoutes, Routes } from 'constants/routes';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { getRoute, handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import AccountInformation from 'components/areas/Information/AccountInformation';
import AuthorizedPerson from 'components/areas/Information/AuthorizedPerson';
import CustomerProfile from 'components/areas/Information/CustomerProfile';

interface IInformationProps
  extends React.ClassAttributes<InformationComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly config: IState['config'];
}

class InformationComponent extends React.Component<IInformationProps> {
  constructor(props: IInformationProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, location, config } = this.props;
    const route = Routes.INFORMATION;
    const subRoute = location.pathname.replace(`/${route}/`, '');
    const { title } = getRoute(
      config.nav,
      route,
      subRoute,
      this.props.selectedAccount?.type
    );

    return (
      <Layout route={route}>
        <div className={styles.Information}>
          <div className={styles.InformationContent}>
            <div className={styles.InformationTitle}>
              <div className={styles.Title}>{t(title || '')}</div>
            </div>
            <div className={styles.InformationData}>
              <Switch>
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}`}
                  component={AccountInformation}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${InfoRoutes.CHANGE_PASSWORD}`}
                  component={AccountInformation}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${InfoRoutes.PROFILE}`}
                  component={CustomerProfile}
                />
                <CommonRoute
                  exact={true}
                  route={route}
                  path={`/${route}/${InfoRoutes.AUTHORIZED}`}
                  component={AuthorizedPerson}
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
  config: state.config,
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {};

const Information = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(InformationComponent)
    ),
    Fallback,
    handleError
  )
);

export default Information;
