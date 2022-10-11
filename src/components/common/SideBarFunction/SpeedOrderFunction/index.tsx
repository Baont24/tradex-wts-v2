import * as React from 'react';
import * as styles from './styles.scss';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from 'components/common/Fallback';
import SpeedOrder from 'components/common/SpeedOrder';

interface ISpeedOrderFunctionProps
  extends React.ClassAttributes<SpeedOrderFunctionComponent>,
    WithNamespaces {}

// interface ISpeedOrderFunctionState {}

class SpeedOrderFunctionComponent extends React.Component<
  ISpeedOrderFunctionProps
> {
  constructor(props: ISpeedOrderFunctionProps) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className={styles.SpeedOrderFunction}>
        <SpeedOrder />
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({});

const mapDispatchToProps = {};

const SpeedOrderFunction = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(SpeedOrderFunctionComponent)
  ),
  Fallback,
  handleError
);

export default SpeedOrderFunction;
