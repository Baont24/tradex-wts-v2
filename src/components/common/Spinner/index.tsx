import * as React from 'react';
import * as styles from './styles.scss';
import { Spinner as SpinnerBootstrap } from 'react-bootstrap';

export interface ISpinnerProps {
  readonly size?: string | number;
  readonly borderWidth?: string | number;
  readonly logo?: boolean;
}

export default class Spinner extends React.Component<ISpinnerProps> {
  constructor(props: ISpinnerProps) {
    super(props);

    this.state = {};
  }

  render() {
    const cssStyles: React.CSSProperties = {
      width: this.props.size,
      height: this.props.size,
    };

    const LogoSpinner = './injectable/spinner.svg';

    return (
      <div
        className={`${styles.Spinner} animate__zoomIn animate__zoomOut`}
        style={{ ...cssStyles, borderWidth: this.props.borderWidth || 5 }}
      >
        <SpinnerBootstrap
          className={styles.Spinning}
          style={cssStyles}
          animation="border"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </SpinnerBootstrap>
        {this.props.logo && (
          <div className={styles.Logo} style={cssStyles}>
            <img src={LogoSpinner} style={cssStyles} />
          </div>
        )}
      </div>
    );
  }
}
