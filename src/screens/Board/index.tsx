import * as React from 'react';
import { BoardRoutes, Routes } from 'constants/routes';
import { CommonRoute, Fallback, Layout } from 'components/common';
import { IState } from 'redux/global-reducers';
import { PriceBoard, TradingTemplate } from 'components/areas/Board';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface IBoardProps
  extends React.ClassAttributes<BoardComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly config: IState['config'];
}

class BoardComponent extends React.Component<IBoardProps> {
  constructor(props: IBoardProps) {
    super(props);

    this.state = {};
  }

  render() {
    const route = Routes.BOARD;

    return (
      <Layout route={route}>
        <Switch>
          <CommonRoute
            exact={true}
            route={route}
            path={`/${route}/${BoardRoutes.TRADING_TEMPLATE}`}
            component={TradingTemplate}
          />
          <Route
            exact={true}
            route={route}
            path={`/${route}/:key`}
            component={PriceBoard}
          />
          <Route
            exact={true}
            route={route}
            path={`/${route}`}
            component={PriceBoard}
          />
          <Route>
            <Redirect to={`/${route}`} />
          </Route>
        </Switch>
      </Layout>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  config: state.config,
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {};

const Board = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(BoardComponent)
    ),
    Fallback,
    handleError
  )
);

export default Board;
