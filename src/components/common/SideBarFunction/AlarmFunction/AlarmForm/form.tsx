import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  DateRangePicker,
  Dropdown,
  Fallback,
  NumericInput,
  SymbolSearch,
} from 'components/common';
import { Field, Form } from 'formik';
import { FormAction } from 'constants/enum';
import { IAlarmForm } from 'interfaces/market';
import { IFormProps } from 'interfaces/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { formatDateToString, formatStringToDate } from 'utils/datetime';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IAlarmFormProps
  extends React.ClassAttributes<AlarmFormComponent>,
    WithNamespaces,
    IFormProps<IAlarmForm> {
  readonly action?: FormAction;
}

class AlarmFormComponent extends React.Component<IAlarmFormProps> {
  constructor(props: IAlarmFormProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, values } = this.props;

    return (
      <Form className={styles.AlarmForm}>
        <span className={styles.FormTitle}>
          {this.props.action === FormAction.CREATE
            ? t('Create Alert')
            : t('Edit Alert')}
        </span>
        <div className={styles.FormRow}>
          <div className={`${styles.FormCell} ${globalStyles.Ellipsis}`}>
            {t('Alert by')}
          </div>
          <div className={styles.FormCell}>
            <Dropdown
              data={[{ title: 'ABC', value: 'ABC' }]}
              isForm={true}
              activeItem={values.alertBy}
              placeholder={values.alertBy}
              onSelect={this.onAlertBySelect}
            />
          </div>
        </div>
        <div className={styles.FormRow}>
          <div className={`${styles.FormCell} ${globalStyles.Ellipsis}`}>
            {t('Symbol')}
          </div>
          <div className={styles.FormCell}>
            <SymbolSearch
              isForm={true}
              placeholder={values.symbol}
              onSymbolSearch={this.onSymbolSelect}
            />
          </div>
        </div>
        <div className={classNames(styles.FormRow, styles.ConditionRow)}>
          <div className={`${styles.FormCell} ${globalStyles.Ellipsis}`}>
            {t('Condition')}
          </div>
          <div className={styles.FormCell}>
            <Dropdown data={[{ title: 'ABC', value: 'ABC' }]} isForm={true} />
            <NumericInput
              onChange={this.onConditionChange}
              value={values.condition}
            />
          </div>
        </div>
        <div className={styles.FormRow}>
          <div className={`${styles.FormCell} ${globalStyles.Ellipsis}`}>
            {t('Frequency')}
          </div>
          <div className={styles.FormCell}>
            <Dropdown data={[{ title: 'ABC', value: 'ABC' }]} isForm={true} />
          </div>
        </div>
        <div className={styles.FormRow}>
          <div className={`${styles.FormCell} ${globalStyles.Ellipsis}`}>
            {t('Expiration')}
          </div>
          <div className={styles.FormCell}>
            <DateRangePicker
              onChangeStartDate={this.onExpirationFromChange}
              onChangeEndDate={this.onExpirationToChange}
              startDate={formatStringToDate(values.expirationFrom, 'yyyyMMdd')}
              endDate={formatStringToDate(values.expirationTo, 'yyyyMMdd')}
            />
          </div>
        </div>
        <div className={styles.FormRow}>
          <div className={`${styles.FormCell} ${globalStyles.Ellipsis}`}>
            {t('Delivery by')}
          </div>
          <div className={styles.FormCell}>
            <Dropdown data={[{ title: 'ABC', value: 'ABC' }]} isForm={true} />
          </div>
        </div>
        <div className={classNames(styles.FormRow, styles.MessageRow)}>
          <div className={`${styles.FormCell} ${globalStyles.Ellipsis}`}>
            {t('Message')}
          </div>
          <div className={styles.FormCell}>
            <Field
              className={styles.TextareaForm}
              as="textarea"
              name="message"
              rows={2}
            />
          </div>
        </div>
        <div className={styles.FormSubmit}>
          <div className={`${styles.Cancel} ${styles.FormButton}`}>
            {t('Cancel')}
          </div>
          <div
            className={`${styles.Submit} ${styles.FormButton}`}
            onClick={this.props.submitForm}
          >
            {t('Create')}
          </div>
        </div>
      </Form>
    );
  }

  private onAlertBySelect = (title: string, value: string) => {
    this.props.setFieldValue('alertBy', value);
  };

  private onSymbolSelect = (code: string | null) => {
    this.props.setFieldValue('symbol', code);
  };

  private onExpirationFromChange = (date: Date) => {
    this.props.setFieldValue(
      'expirationFrom',
      formatDateToString(date, 'yyyyMMdd')
    );
  };

  private onExpirationToChange = (date: Date) => {
    this.props.setFieldValue(
      'expirationTo',
      formatDateToString(date, 'yyyyMMdd')
    );
  };

  private onConditionChange = (value: number | null) => {
    this.props.setFieldValue('condition', value);
  };
}

const AlarmForm = withErrorBoundary(
  withNamespaces('common')(AlarmFormComponent),
  Fallback,
  handleError
);

export default AlarmForm;
