import * as React from 'react';
import * as styles from './styles.scss';
import {
  CheckBox,
  DateRangePicker,
  Dropdown,
  Fallback,
} from 'components/common';
import { Form } from 'formik';
import { IFormProps } from 'interfaces/common';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString, formatStringToDate } from 'utils/datetime';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import config from 'config';

export const NEWS_CATEGORY = [
  { value: 'ALL', title: 'ALL' },
  { value: 'market-news', title: 'Market News' },
  { value: 'exchange-news', title: 'Exchange news' },
  {
    value: 'analysis-report',
    title: 'Domain analysis report',
    params: { domain: config.domain },
  },
];

export interface INewsFilterForm {
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly category?: string;
  readonly subCategory?: string;
  readonly list?: string;
}

interface INewsFilterFormProps
  extends React.ClassAttributes<NewsFilterFormComponent>,
    WithNamespaces,
    IFormProps<INewsFilterForm> {}

interface INewsFilterFormState {
  readonly isCategoryChecked?: boolean;
  readonly isListChecked?: boolean;
}

class NewsFilterFormComponent extends React.Component<
  INewsFilterFormProps,
  INewsFilterFormState
> {
  constructor(props: INewsFilterFormProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, values } = this.props;

    return (
      <Form className={styles.NewsFilterForm}>
        <div className={styles.FormSection}>
          <div className={styles.FormRow}>
            <div className={styles.CheckBoxSection} />
            <div className={styles.TitleSection}>{t('Date')}</div>
            <DateRangePicker
              onChangeStartDate={this.onChangeStartDate}
              onChangeEndDate={this.onChangeEndDate}
              startDate={formatStringToDate(values.fromDate, 'yyyyMMdd')}
              endDate={formatStringToDate(values.toDate, 'yyyyMMdd')}
            />
          </div>
          <div className={styles.FormRow}>
            <div className={styles.CheckBoxSection}>
              <CheckBox onChange={this.onCategoryCheckboxChange} />
            </div>
            <div className={styles.TitleSection}>{t('Category')}</div>
            <div className={styles.FieldSection}>
              <Dropdown
                isForm={true}
                disabled={!this.state.isCategoryChecked}
                data={NEWS_CATEGORY}
                activeItem={values.category}
                onSelect={this.onCategoryChange}
              />
            </div>
            <div className={styles.FieldSection}>
              <Dropdown
                isForm={true}
                data={NEWS_CATEGORY}
                disabled={!this.state.isCategoryChecked}
                activeItem={values.subCategory}
                onSelect={this.onSubCategoryChange}
              />
            </div>
          </div>
          <div className={styles.FormRow}>
            <div className={styles.CheckBoxSection}>
              <CheckBox onChange={this.onListCheckboxChange} />
            </div>
            <div className={styles.TitleSection}>{t('List')}</div>
            <div className={styles.FieldSection}>
              <Dropdown
                isForm={true}
                data={NEWS_CATEGORY}
                disabled={!this.state.isListChecked}
                activeItem={values.list}
                onSelect={this.onListChange}
              />
            </div>
          </div>
        </div>
        <div className={styles.ButtonSection}>
          <button type="button" className={styles.CancelButton}>
            {t('Cancel')}
          </button>
          <button type="submit" className={styles.ApplyButton}>
            {t('Apply 2')}
          </button>
        </div>
      </Form>
    );
  }

  private onCategoryCheckboxChange = (checked?: boolean) => {
    this.setState({ isCategoryChecked: checked });
  };

  private onListCheckboxChange = (checked?: boolean) => {
    this.setState({ isListChecked: checked });
  };

  private onChangeStartDate = (date: Date) => {
    this.props.setFieldValue('fromDate', formatDateToString(date, 'yyyyMMdd'));
  };

  private onChangeEndDate = (date: Date) => {
    this.props.setFieldValue('toDate', formatDateToString(date, 'yyyyMMdd'));
  };

  private onCategoryChange = (title: string, value: string) => {
    this.props.setFieldValue('category', value);
  };

  private onSubCategoryChange = (title: string, value: string) => {
    this.props.setFieldValue('subCategory', value);
  };

  private onListChange = (title: string, value: string) => {
    this.props.setFieldValue('list', value);
  };
}

const mapStateToProps = (state: IState) => ({});

const mapDispatchToProps = {};

const NewsFilterForm = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(NewsFilterFormComponent)
  ),
  Fallback,
  handleError
);

export default NewsFilterForm;
