import * as React from 'react';
import * as styles from './styles.scss';
import classNames from 'classnames';

export interface ILoadingBarProps extends React.ClassAttributes<LoadingBar> {
  readonly size?: string | number;
  readonly logo?: boolean;
}

export default class LoadingBar extends React.Component<ILoadingBarProps> {
  static defaultProps: Partial<ILoadingBarProps> = {
    logo: true,
  };

  constructor(props: ILoadingBarProps) {
    super(props);

    this.state = {};
  }

  render() {
    const cssStyles: React.CSSProperties = {
      width: this.props.size,
      height: 30,
    };

    const LogoLoadingBar = './injectable/logo.svg';

    return (
      <div className={styles.LoadingBar}>
        {this.props.logo && (
          <div
            className={styles.Logo}
            style={{ ...cssStyles, marginBottom: 10 }}
          >
            <img src={LogoLoadingBar} style={cssStyles} />
          </div>
        )}
        <div className={styles.Slider} style={cssStyles}>
          <div className={styles.Line} />
          <div className={classNames(styles.Subline, styles.Inc)} />
          <div className={classNames(styles.Subline, styles.Dec)} />
        </div>
      </div>
    );
  }
}
