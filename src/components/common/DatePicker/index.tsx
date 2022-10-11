import 'react-datepicker/dist/react-datepicker.min.css';
import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { CalendarSVG } from 'assets/svg';
import { Fallback } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';

export interface IDatePickerProps extends WithNamespaces, ReactDatePickerProps {
  readonly icon?: boolean;
  readonly position?: 'left' | 'right';
}

class DatePickerComponent extends React.Component<IDatePickerProps> {
  static defaultProps: Partial<IDatePickerProps> = {
    icon: true,
  };

  constructor(props: IDatePickerProps) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div
        className={classNames(styles.DatePicker, {
          [styles.Right]: this.props.position === 'right',
          [styles.Disabled]: this.props.disabled,
        })}
      >
        <ReactDatePicker {...this.props} />
        {this.props.icon && <CalendarSVG />}
      </div>
    );
  }
}

const DatePicker = withErrorBoundary(
  withNamespaces('common')(DatePickerComponent),
  Fallback,
  handleError
);

export default DatePicker;
