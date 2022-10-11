import * as React from 'react';
import * as style from './style.scss';
import { Fallback } from 'components/common';
import { Form } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IEkycDropdownProps
  extends React.ClassAttributes<EkycDropdownComponent>,
    WithNamespaces {
  readonly title: string;
  readonly onChange?: (val: string) => void;
  readonly validated?: boolean;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly data: any[];
  readonly defaultValue?: string;
}

export interface IEkycDropdownState {
  readonly value: string;
}

class EkycDropdownComponent extends React.Component<
  IEkycDropdownProps,
  IEkycDropdownState
> {
  constructor(props: IEkycDropdownProps) {
    super(props);
    this.state = {
      value: props.defaultValue ?? '',
    };
  }

  render() {
    const { t, defaultValue } = this.props;
    const renderItems = defaultValue
      ? [...this.props.data]
      : ['', ...this.props.data];
    return (
      <div className={style.EkycDropdown}>
        <Form.Group>
          <Form.Label>
            {t(this.props.title)}
            {this.props.required && <span className={style.Required}>*</span>}
          </Form.Label>
          <Form.Control
            as="select"
            onChange={this.onChange}
            placeholder="ABC"
            value={this.state.value}
          >
            {renderItems.map((val, i) => (
              <option key={i}>{val}</option>
            ))}
          </Form.Control>
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
}

const EkycDropdown = withErrorBoundary(
  withNamespaces('common')(EkycDropdownComponent),
  Fallback,
  handleError
);

export default EkycDropdown;
