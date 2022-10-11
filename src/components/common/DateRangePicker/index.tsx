import * as React from 'react';
import * as styles from './styles.scss';
import { DATE_FORMAT_DISPLAY } from 'constants/main';
import { Fallback } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import DatePicker from '../DatePicker';

export interface IDateRangePickerProps
  extends React.ClassAttributes<DateRangePickerComponent>,
    WithNamespaces {
  readonly icon?: boolean;
  readonly startDate?: Date | null;
  readonly endDate?: Date | null;
  readonly minDate?: Date | null;
  readonly maxDate?: Date | null;
  readonly showLabel?: boolean;
  readonly startDateLabel?: string;
  readonly endDateLabel?: string;
  readonly disabled?: boolean;

  readonly onChangeStartDate?: (date: Date) => void;
  readonly onChangeEndDate?: (date: Date) => void;
}

export interface IDateRangePickerState {
  readonly startDate?: Date | null;
  readonly endDate?: Date | null;
}

class DateRangePickerComponent extends React.Component<
  IDateRangePickerProps,
  IDateRangePickerState
> {
  static defaultProps: Partial<IDateRangePickerProps> = {
    icon: true,
  };

  constructor(props: IDateRangePickerProps) {
    super(props);

    this.state = {};
  }

  static getDerivedStateFromProps(
    nextProps: IDateRangePickerProps,
    prevState: IDateRangePickerState
  ): IDateRangePickerState | null {
    return {
      ...(nextProps.endDate !== prevState.endDate && {
        endDate: nextProps.endDate,
      }),
      ...(nextProps.startDate !== prevState.startDate && {
        startDate: nextProps.startDate,
      }),
    };
  }

  render() {
    const { showLabel, t, startDateLabel, endDateLabel } = this.props;

    return (
      <div className={styles.DateRangePicker}>
        {showLabel && (
          <span className={styles.DateTitle}>
            {t(startDateLabel || 'From Date')}
          </span>
        )}
        <DatePicker
          selected={this.state.startDate}
          selectsStart={true}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          minDate={this.props.minDate}
          icon={this.props.icon}
          dateFormat={DATE_FORMAT_DISPLAY}
          onChange={this.onChangeStartDate}
          // peekNextMonth={true}
          showMonthDropdown={true}
          showYearDropdown={true}
          dropdownMode="select"
          disabled={this.props.disabled}
        />
        {showLabel && (
          <span className={styles.DateTitle}>
            {t(endDateLabel || 'End Date')}
          </span>
        )}
        <DatePicker
          selected={this.state.endDate}
          selectsEnd={true}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          minDate={this.state.startDate}
          maxDate={this.props.maxDate}
          icon={this.props.icon}
          position="right"
          dateFormat={DATE_FORMAT_DISPLAY}
          onChange={this.onChangeEndDate}
          // peekNextMonth={true}
          showMonthDropdown={true}
          showYearDropdown={true}
          dropdownMode="select"
          disabled={this.props.disabled}
        />
      </div>
    );
  }

  private onChangeStartDate = (date: Date) => {
    this.setState({ startDate: date }, () => {
      this.props.onChangeStartDate?.(date);
    });
  };

  private onChangeEndDate = (date: Date) => {
    this.setState({ endDate: date }, () => {
      this.props.onChangeEndDate?.(date);
    });
  };
}

const DateRangePicker = withErrorBoundary(
  withNamespaces('common')(DateRangePickerComponent),
  Fallback,
  handleError
);

export default DateRangePicker;
