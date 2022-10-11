import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface ITextBoxProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    WithNamespaces {
  readonly logo?: React.ReactNode;
  readonly logoClassName?: string;

  readonly onTextChange?: (value: string) => void;
  readonly textBoxRef?: (ref: TextBoxComponent) => void;
}

export interface ITextBoxState {
  readonly value?: string;
  readonly disabled?: boolean;
}

class TextBoxComponent extends React.Component<ITextBoxProps, ITextBoxState> {
  constructor(props: ITextBoxProps) {
    super(props);

    this.state = {
      value: props.value as string,
      disabled: props.disabled,
    };
  }

  render() {
    return (
      <div className={styles.TextBox}>
        <input
          onChange={this.onChange}
          onBlur={this.props.onBlur}
          value={this.state.value}
          name={this.props.name}
          type={this.props.type}
          className={this.props.className}
          placeholder={this.props.placeholder}
          autoFocus={this.props.autoFocus}
          autoComplete={this.props.autoComplete}
          style={this.props.style}
          disabled={this.state.disabled}
        />
        {this.props.logo && (
          <div className={classNames(styles.TextBoxLogo)}>
            {this.props.logo}
          </div>
        )}
      </div>
    );
  }

  setValue = (value: string) => {
    this.setState({ value });
  };

  setDisabled = (disabled: boolean) => {
    this.setState({ disabled });
  };

  private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onTextChange?.(event.target.value);
  };
}

const TextBox = withErrorBoundary(
  withNamespaces('common', {
    wait: true,
    innerRef: (ref: TextBoxComponent) => {
      ref?.props.textBoxRef?.(ref);
    },
  })(TextBoxComponent),
  Fallback,
  handleError
);

export default TextBox;
