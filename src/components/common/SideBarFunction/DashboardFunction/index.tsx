import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Fallback, ScrollBar } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import MainIndice from './MainIndices';
import News from './News';
import WatchlistBoard from './WatchlistBoard';

export interface IDashboardFunctionProps
  extends React.ClassAttributes<DashboardFunctionComponent>,
    WithNamespaces {}

export interface IDashboardFunctionState {
  readonly isWatchlistCollapsed?: boolean;
  readonly isMainIndiceCollapsed?: boolean;
  readonly isNewsCollapsed?: boolean;
}

class DashboardFunctionComponent extends React.Component<
  IDashboardFunctionProps,
  IDashboardFunctionState
> {
  constructor(props: IDashboardFunctionProps) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <ScrollBar autoHide={true}>
        <div className={styles.DashboardFunction}>
          <div
            className={classNames(styles.DashboardItem, {
              [styles.Collapse]: this.state.isWatchlistCollapsed,
            })}
          >
            <WatchlistBoard
              collapsed={this.state.isWatchlistCollapsed}
              onCollapse={this.onWatchlistCollapse}
            />
          </div>
          <div
            className={classNames(styles.DashboardItem, {
              [styles.Collapse]: this.state.isMainIndiceCollapsed,
            })}
          >
            <MainIndice
              collapsed={this.state.isMainIndiceCollapsed}
              onCollapse={this.onMainIndiceCollapse}
            />
          </div>
          {false && (
            <div
              className={classNames(styles.DashboardItem, {
                [styles.Collapse]: this.state.isNewsCollapsed,
              })}
            >
              <News
                collapsed={this.state.isNewsCollapsed}
                onCollapse={this.onNewsCollapse}
              />
            </div>
          )}
        </div>
      </ScrollBar>
    );
  }

  private onWatchlistCollapse = () => {
    this.setState({ isWatchlistCollapsed: !this.state.isWatchlistCollapsed });
  };

  private onMainIndiceCollapse = () => {
    this.setState({ isMainIndiceCollapsed: !this.state.isMainIndiceCollapsed });
  };

  private onNewsCollapse = () => {
    this.setState({ isNewsCollapsed: !this.state.isNewsCollapsed });
  };
}

const DashboardFunction = withErrorBoundary(
  withNamespaces('common')(DashboardFunctionComponent),
  Fallback,
  handleError
);

export default DashboardFunction;
