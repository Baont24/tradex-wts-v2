import * as React from 'react';
import { IState } from 'redux/global-reducers';
import { Redirect, Route, RouteProps } from 'react-router';
import { Routes } from 'constants/routes';
import { connect } from 'react-redux';

interface IAuthRoute extends RouteProps {
  readonly isAuthenticated: IState['isAuthenticated'];
  readonly redirect: string;
  readonly isLoginRoute?: boolean;
}

class AuthRouteComponent extends React.Component<IAuthRoute> {
  static defaultProps = {
    redirect: `/${Routes.BOARD}`,
  };

  render() {
    const {
      isAuthenticated,
      isLoginRoute,
      redirect,
      ...routeProps
    } = this.props;

    const isAccessable = isLoginRoute ? !isAuthenticated : isAuthenticated;

    return isAccessable ? (
      <Route {...routeProps} />
    ) : (
      <Redirect to={redirect} />
    );
  }
}

const mapStateToProps = (state: IState) => ({
  isAuthenticated: state.isAuthenticated,
});

const AuthRoute = connect(mapStateToProps)(AuthRouteComponent);

export default AuthRoute;
