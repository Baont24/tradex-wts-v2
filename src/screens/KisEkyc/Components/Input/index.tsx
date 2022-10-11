import * as React from 'react';
import * as style from './style.scss';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { Fallback } from 'components/common';
import { Form, InputGroup } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IEkycInputProps
  extends React.ClassAttributes<EkycInputComponent>,
    WithNamespaces {
  readonly defaultValue: string;
  readonly title: string;
  readonly onChange?: (val: string) => void;
  readonly isHideIcon?: boolean;
  readonly showError?: boolean;
  readonly validated?: boolean;
  readonly disabled?: boolean;
  readonly required?: boolean;
}

export interface IEkycInputState {
  readonly value: string;
  readonly showError: boolean;
}

class EkycInputComponent extends React.Component<
  IEkycInputProps,
  IEkycInputState
> {
  constructor(props: IEkycInputProps) {
    super(props);
    this.state = {
      value: props.defaultValue || '',
      showError: props.showError || false,
    };
  }

  render() {
    const { t } = this.props;
    let validated = true;
    if (this.props.validated !== undefined) {
      validated = this.props.validated;
    }
    const isValid = this.props.required
      ? this.state.value.trim().length > 0 && validated
      : validated;
    return (
      <div className={style.EkycInput}>
        <Form.Group>
          <Form.Label>
            {t(this.props.title)}
            {this.props.required && <span className={style.Required}>*</span>}
          </Form.Label>
          {this.props.isHideIcon || this.props.disabled ? (
            <Form.Control
              type="text"
              value={this.state.value}
              onChange={this.onChange}
              disabled={this.props.disabled}
              required={this.props.required}
            />
          ) : (
            <InputGroup className="mb-2">
              <Form.Control
                type="text"
                value={this.state.value}
                onChange={this.onChange}
                disabled={this.props.disabled}
                required={this.props.required}
                onBlur={this.onBlur}
              />
              <InputGroup.Prepend>
                <InputGroup.Text>
                  {this.state.showError ? (
                    isValid ? (
                      <FaCheck color="#27AE60" />
                    ) : (
                      <FaTimes color="#EB5757" />
                    )
                  ) : null}
                </InputGroup.Text>
              </InputGroup.Prepend>
            </InputGroup>
          )}
        </Form.Group>
      </div>
    );
  }

  private onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ value: e.currentTarget.value });
    if (this.props.onChange) {
      this.props.onChange(e.currentTarget.value);
    }
  };

  private onBlur = () => {
    this.setState({ showError: true });
  };
}

const EkycInput = withErrorBoundary(
  withNamespaces('common')(EkycInputComponent),
  Fallback,
  handleError
);

export default EkycInput;
