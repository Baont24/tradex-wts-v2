import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { FaCaretDown, FaCaretUp, FaSearch } from 'react-icons/fa';
import { Fallback, ScrollBar, TextBox } from 'components/common';
import { FilterSVG } from 'assets/svg';
import { Formik } from 'formik';
import { Overlay, Popover } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import NewsFilterForm, { INewsFilterForm, NEWS_CATEGORY } from './form';

const initialValues: INewsFilterForm = {};

export interface INewsProps
  extends React.ClassAttributes<NewsComponent>,
    WithNamespaces {
  readonly collapsed?: boolean;

  readonly onCollapse: () => void;
}

export interface INewsState {
  readonly category: string;
  readonly isCategoryShown?: boolean;
  readonly isSettingShown?: boolean;
}

class NewsComponent extends React.Component<INewsProps, INewsState> {
  private localCategoryRef: React.RefObject<HTMLDivElement>;
  private localSettingRef: React.RefObject<HTMLDivElement>;

  constructor(props: INewsProps) {
    super(props);

    this.state = {
      category: NEWS_CATEGORY[0].value,
    };

    this.localCategoryRef = React.createRef();
    this.localSettingRef = React.createRef();
  }

  render() {
    const { t } = this.props;

    return (
      <div className={styles.News}>
        <div className={styles.Header}>
          <div className={styles.Left}>
            <div className={styles.Title}>
              {t('News')}
              <div className={styles.TitleUnderline} />
            </div>
            <div ref={this.localCategoryRef} onClick={this.onTriggerCategory}>
              <FaCaretDown />
            </div>
          </div>
          <div className={styles.Right}>
            <div className={classNames(styles.MenuItem, styles.NewsSearch)}>
              <TextBox
                placeholder={t('Keyword')}
                logo={<FaSearch />}
                onTextChange={this.onSearch}
              />
            </div>
            <div
              className={styles.MenuItem}
              onClick={this.onTriggerSetting}
              ref={this.localSettingRef}
            >
              <FilterSVG />
            </div>
            <div className={styles.MenuItem}>
              <div
                className={styles.CollapseButton}
                onClick={this.props.onCollapse}
              >
                {this.props.collapsed ? <FaCaretDown /> : <FaCaretUp />}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.Content}>
          <ScrollBar autoHide={true}>
            <div className={styles.NewsItem}>
              <a className={styles.Title} href="#" target="_blank">
                Lãi suất huy động thấp nhất nhiều năm, lãi vay chưa giảm tương
                ứng
              </a>
              <div className={styles.Detail}>
                <a className={styles.Source} href="#" target="_blank">
                  vietstock.vn
                </a>
                <div className={styles.CreatedDate}>17/09/2020</div>
              </div>
            </div>
          </ScrollBar>
        </div>
        <Overlay
          show={this.state.isCategoryShown}
          onHide={this.onHideCategory}
          placement="bottom"
          rootClose={true}
          container={this.localCategoryRef}
          target={this.localCategoryRef}
        >
          <Popover id={styles.PopoverNews} className={globalStyles.Popover}>
            {NEWS_CATEGORY.map((val, idx) => {
              const onClick = () => this.onCategoryClick(val.value);
              return (
                <div
                  key={idx}
                  className={styles.NewsMenuItem}
                  onClick={onClick}
                >
                  {t(val.title)}
                </div>
              );
            })}
          </Popover>
        </Overlay>
        <Overlay
          show={this.state.isSettingShown}
          onHide={this.onHideSetting}
          placement="bottom"
          rootClose={true}
          container={this.localSettingRef}
          target={this.localSettingRef}
        >
          <Popover id={styles.PopoverSetting} className={globalStyles.Popover}>
            <Formik
              initialValues={initialValues}
              onSubmit={this.onSubmitFilter}
            >
              {(props) => <NewsFilterForm {...props} />}
            </Formik>
          </Popover>
        </Overlay>
      </div>
    );
  }

  private onSubmitFilter = (values: INewsFilterForm) => {
    console.log('value', values);
  };

  private onSearch = (value: string) => {
    console.log('value', value);
  };

  private onCategoryClick = (value: string) => {
    this.setState({ category: value, isCategoryShown: false });
  };

  private onTriggerCategory = () => {
    this.setState({ isCategoryShown: !this.state.isCategoryShown });
  };

  private onHideCategory = () => {
    this.setState({ isCategoryShown: false });
  };

  private onTriggerSetting = () => {
    this.setState({ isSettingShown: !this.state.isSettingShown });
  };

  private onHideSetting = () => {
    this.setState({ isSettingShown: false });
  };
}

const News = withErrorBoundary(
  withNamespaces('common')(NewsComponent),
  Fallback,
  handleError
);

export default News;
