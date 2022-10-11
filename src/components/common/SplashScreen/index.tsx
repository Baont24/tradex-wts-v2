import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { SplashScreenType } from 'constants/enum';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import LoadingBar from '../LoadingBar';
import Spinner from '../Spinner';
import config from 'config';

export interface ISplashScreenProps
  extends React.ClassAttributes<SplashScreenComponent> {
  readonly config: IState['config'];
}

class SplashScreenComponent extends React.Component<ISplashScreenProps> {
  constructor(props: ISplashScreenProps) {
    super(props);
  }

  render() {
    return (
      <div className={styles.SplashScreen}>
        {domainConfig[config.domain]?.splashScreenType ===
        SplashScreenType.LOADINGBAR ? (
          <LoadingBar size={200} />
        ) : (
          <Spinner size={150} />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  config: state.config,
});

const SplashScreen = withErrorBoundary(
  connect(mapStateToProps)(SplashScreenComponent),
  Fallback,
  handleError
);

export default SplashScreen;
