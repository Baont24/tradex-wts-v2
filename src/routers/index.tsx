import * as React from 'react';
import { Account, Board, ForgotPassword, Information, Login } from 'screens';
import { AuthRoute, Fallback, SplashScreen } from 'components/common';
import { BrowserRouter } from 'react-router-dom';
import { IState } from 'redux/global-reducers';
import { Redirect, Route, Switch } from 'react-router';
import { Routes } from 'constants/routes';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { initSocket } from './actions';
import { setCurrentSymbol } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import EkycScreen from 'screens/KisEkyc';
import config from 'config';

interface IRoutersProps extends React.ClassAttributes<Routers> {
  readonly i18n: IState['i18n'];
  readonly wtsSocket: IState['wtsSocket'];
  readonly router: IState['router'];
  readonly config: IState['config'];
  readonly resetRouter: IState['resetRouter'];
  readonly isAuthenticated: IState['isAuthenticated'];

  readonly initSocket: typeof initSocket;
  readonly setCurrentSymbol: typeof setCurrentSymbol;
}

class Routers extends React.Component<IRoutersProps> {
  constructor(props: IRoutersProps) {
    super(props);

    props.initSocket();

    this.state = {};
  }

  render() {
    const enableEkyc = config.enableEkyc;
    return this.props.i18n ? (
      <BrowserRouter>
        <Switch>
          <Route exact={true} path="/">
            <Redirect to={`/${this.props.config.redirect ?? Routes.BOARD}`} />
          </Route>
          {!this.props.config.disableLogin && (
            <AuthRoute
              exact={true}
              path={`/${Routes.LOGIN}`}
              component={Login}
              isLoginRoute={true}
            />
          )}
          <Route path={`/${Routes.BOARD}`} component={Board} />
          <Route
            path={`/${Routes.FORGOT_PASSWORD}`}
            component={ForgotPassword}
          />
          <AuthRoute path={`/${Routes.ACCOUNT}`} component={Account} />
          <AuthRoute path={`/${Routes.INFORMATION}`} component={Information} />
          {enableEkyc && (
            <Route
              exact
              path={`/${Routes.EKYC}`}
              component={() => <EkycScreen />}
            />
          )}
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </BrowserRouter>
    ) : (
      <SplashScreen />
    );
  }
}

const mapStateToProps = (state: IState) => ({
  wtsSocket: state.wtsSocket,
  i18n: state.i18n,
  router: state.router,
  config: state.config,
  resetRouter: state.resetRouter,
  isAuthenticated: state.isAuthenticated,
});

const mapDispatchToProps = { initSocket, setCurrentSymbol };

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(Routers),
  Fallback,
  handleError
);
