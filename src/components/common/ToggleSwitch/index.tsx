import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IToogleSwitchProps
  extends React.ClassAttributes<ToogleSwitchComponent>,
    WithNamespaces {
  readonly checked?: boolean;
  readonly label?: string;
  readonly lableClassName?: string;

  readonly onChange?: (checked: boolean) => void;
}

export interface IToogleSwitchState {
  readonly checked?: boolean;
}

class ToogleSwitchComponent extends React.Component<
  IToogleSwitchProps,
  IToogleSwitchState
> {
  constructor(props: IToogleSwitchProps) {
    super(props);

    this.state = {
      checked: props.checked,
    };
  }

  static getDerivedStateFromProps(
    nextProps: IToogleSwitchProps,
    prevState: IToogleSwitchState
  ): Partial<IToogleSwitchState> | null {
    if (nextProps.checked !== prevState.checked) {
      return {
        checked: nextProps.checked,
      };
    }
    return null;
  }

  render() {
    return (
      <div className={styles.ToggleSwitch}>
        <label className={styles.Switch}>
          <input
            type="checkbox"
            aria-checked={this.state.checked}
            checked={this.state.checked}
            onChange={this.onChange}
          />
          <span className={`${styles.Slider} ${styles.Round}`} />
        </label>
        {this.props.label && (
          <span
            className={`${styles.Label} ${this.props.lableClassName || ''}`}
            onClick={this.onChange}
          >
            {this.props.t(this.props.label)}
          </span>
        )}
      </div>
    );
  }

  private onChange = () => {
    const output = !this.state.checked;
    this.setState({
      checked: output,
    });
    if (this.props.onChange != null) {
      this.props.onChange(output);
    }
  };
}

const mapStateToProps = (state: IState) => ({});

const mapDispatchToProps = {};

const ToogleSwitch = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(ToogleSwitchComponent)
  ),
  Fallback,
  handleError
);

export default ToogleSwitch;
