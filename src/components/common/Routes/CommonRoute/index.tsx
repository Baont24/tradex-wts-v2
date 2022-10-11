import * as React from 'react';
import { IState } from 'redux/global-reducers';
import { Redirect, Route, RouteProps } from 'react-router';
import { Routes } from 'constants/routes';
import { connect } from 'react-redux';
import { getRoute } from 'utils/common';

interface IAccountRoute extends RouteProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly config: IState['config'];
  readonly isAuthenticated: IState['isAuthenticated'];
  readonly route: Routes;
}

class CommonRouteComponent extends React.Component<IAccountRoute> {
  render() {
    const {
      route,
      config,
      selectedAccount,
      isAuthenticated,
      ...routeProps
    } = this.props;
    const subRoute = (routeProps.path as string).replace(`/${route}/`, '');
    const { route: verifiedRoute } = getRoute(
      config.nav,
      route,
      subRoute,
      selectedAccount?.type,
      isAuthenticated
    );

    return subRoute === `/${route}` || subRoute === verifiedRoute ? (
      <Route {...routeProps} />
    ) : (
      <Redirect to={`/${route}`} />
    );
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  config: state.config,
  isAuthenticated: state.isAuthenticated,
});

const CommonRoute = connect(mapStateToProps)(CommonRouteComponent);

export default CommonRoute;
