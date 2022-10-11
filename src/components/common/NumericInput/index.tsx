import * as React from 'react';
import * as ReactNumericInput from 'react-numeric-input';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { formatNumber, handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface INumericInputProps
  extends ReactNumericInput.NumericInputProps {
  readonly error?: boolean;
  readonly errorMessage?: string;
  readonly hideButton?: boolean;
  readonly containerRef?: React.RefObject<HTMLDivElement>;

  readonly onNumberChange?: (
    value: number | undefined,
    stringValue: string
  ) => void;
  readonly inputRef?: (ref: NumericInputComponent) => void;
  readonly onFormat?: (value: number | null) => string;
  readonly onParse?: (stringValue: string) => number;
}

interface INumericInputState {
  readonly value?: string | number;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
}

export class NumericInputComponent extends React.PureComponent<
  INumericInputProps,
  INumericInputState
> {
  private inputRef: React.RefObject<
    ReactNumericInput & { refsInput?: HTMLInputElement }
  >;

  constructor(props: INumericInputProps) {
    super(props);

    this.state = {
      value: props.value ?? (props.min as number) ?? 0,
      disabled: props.disabled,
      readOnly: props.readOnly,
    };

    this.inputRef = React.createRef();
  }

  static getDerivedStateFromProps(
    nextProps: INumericInputProps,
    prevState: INumericInputState
  ): Partial<INumericInputState> | null {
    return {
      disabled: nextProps.disabled,
      readOnly: nextProps.readOnly,
      ...(nextProps.value !== prevState.value && { value: nextProps.value }),
    };
  }

  render() {
    const {
      onNumberChange,
      inputRef,
      containerRef,
      onFormat,
      onParse,
      error,
      errorMessage,
      ...rest
    } = this.props;

    return (
      <div
        className={classNames(styles.NumericInput, {
          [styles.Error]: this.props.error,
          [styles.HideButton]: this.props.hideButton,
        })}
        ref={containerRef}
      >
        <ReactNumericInput
          {...rest}
          format={onFormat || this.onFormat}
          parse={onParse || this.onParse}
          onChange={this.onChange}
          value={this.state.value}
          disabled={this.state.disabled}
          readOnly={this.state.readOnly}
          ref={this.inputRef}
        />
        {error && errorMessage && (
          <p className="text-warning text-left">{errorMessage}</p>
        )}
      </div>
    );
  }

  setValue = (value?: number | string) => {
    this.setState({ value }, () => {
      this.props.onNumberChange?.(value as number, value?.toString() ?? '');
    });
  };

  setDisabled = (disabled: boolean) => {
    this.setState({ disabled });
  };

  setReadOnly = (readOnly: boolean) => {
    this.setState({ readOnly });
  };

  private onFormat = (value: number | null) => {
    return formatNumber(value ?? undefined, 3);
  };

  private onParse = (stringValue: string) => {
    return parseFloat(stringValue.replace(/,/g, ''));
  };

  private onChange = (value: number | null, stringValue: string) => {
    this.handleCursorChange(Number(this.state.value), value ?? undefined);
    this.setState(
      {
        value: value ?? undefined,
      },
      () => {
        this.props.onNumberChange?.(value ?? undefined, stringValue);
      }
    );
  };

  private handleCursorChange = (oldValue?: number, newValue?: number) => {
    const inputRef = this.inputRef.current;
    if (
      newValue != null &&
      oldValue != null &&
      inputRef?.state.selectionStart != null &&
      inputRef.state.selectionEnd != null
    ) {
      if (newValue > 0) {
        if (
          String(newValue).length % 3 === 1 &&
          String(newValue).length > String(oldValue).length
        ) {
          inputRef.setState({
            selectionStart: inputRef.state.selectionStart + 1,
            selectionEnd: inputRef.state.selectionEnd + 1,
          });
        } else if (
          String(newValue).length % 3 === 0 &&
          String(newValue).length === String(oldValue).length - 1
        ) {
          inputRef.setState({
            selectionStart: inputRef.state.selectionStart - 1,
            selectionEnd: inputRef.state.selectionEnd - 1,
          });
        }
      }
    } else if (newValue == null) {
      inputRef?.setState({
        selectionStart: 1,
        selectionEnd: 1,
      });
    }
  };
}

const NumericInput = withErrorBoundary(
  NumericInputComponent,
  Fallback,
  handleError
);

export default NumericInput;
