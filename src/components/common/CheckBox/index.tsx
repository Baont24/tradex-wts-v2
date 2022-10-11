import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';

interface ICheckBoxProps
  extends React.ClassAttributes<CheckBoxComponent>,
    WithNamespaces {
  readonly checked?: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly labelStyle?: string;

  readonly onChange?: (value: boolean) => void;
  readonly checkBoxRef?: (ref: CheckBoxComponent) => void;
}

interface ICheckBoxState {
  readonly checked: boolean;
  readonly disabled?: boolean;
}

export class CheckBoxComponent extends React.Component<
  ICheckBoxProps,
  ICheckBoxState
> {
  constructor(props: ICheckBoxProps) {
    super(props);
    this.state = {
      checked: props.checked || false,
      disabled: props.disabled,
    };
  }

  componentDidUpdate(prevProps: ICheckBoxProps) {
    if (prevProps.checked !== this.props.checked) {
      this.setState({
        checked: this.props.checked || false,
      });
    }
  }

  render() {
    const { t } = this.props;

    return (
      <div
        className={classNames(styles.CheckBox, {
          [styles.Disabled]: this.props.disabled,
        })}
        onClick={this.onChange}
      >
        <input
          type="checkbox"
          checked={this.state.checked}
          onChange={this.onCheck}
          disabled={this.state.disabled}
        />
        <label className={styles.CheckBoxCustom} />
        {this.props.label != null && (
          <span
            {...(this.props.labelStyle && { className: this.props.labelStyle })}
          >
            {t(this.props.label)}
          </span>
        )}
      </div>
    );
  }

  setChecked(checked: boolean) {
    this.setState({
      checked,
    });
  }

  setDisabled = (disabled: boolean) => {
    this.setState({ disabled });
  };

  private onChange = () => {
    if (this.props.disabled) {
      return;
    }

    this.setState(
      {
        checked: !this.state.checked,
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange(this.state.checked);
        }
      }
    );
  };

  private onCheck = () => {
    return;
  };
}

const CheckBox = withErrorBoundary(
  withNamespaces('common', {
    wait: true,
    innerRef: (ref: CheckBoxComponent) => {
      ref?.props.checkBoxRef?.(ref);
    },
  })(CheckBoxComponent),
  Fallback,
  handleError
);

export default CheckBox;
