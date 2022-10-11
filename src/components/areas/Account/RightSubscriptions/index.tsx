import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Fallback,
  SheetData,
  SymbolSearch,
} from 'components/common';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IAccount } from 'interfaces/common';
import { IEquityRightSubscriptionsParams } from 'interfaces/api';
import { IState } from 'redux/global-reducers';
import { QUERY_FETCH_COUNT } from 'constants/main';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString, getDateAMonthAgo } from 'utils/datetime';
import { handleError } from 'utils/common';
import { isString } from 'lodash';
import { queryRightExerciseSubscriptions } from './action';
import { withErrorBoundary } from 'react-error-boundary';

interface IRightSubscriptionsProps
  extends React.ClassAttributes<RightSubscriptionsComponent>,
    WithNamespaces {
  readonly selectedAccount: IState['selectedAccount'];
  readonly rightExerciseSubscriptions: IState['equytyRightExerciseSubscriptions'];

  readonly queryRightExerciseSubscriptions: typeof queryRightExerciseSubscriptions;
}

interface IRightSubscriptionsState {
  readonly fromDate: Date;
  readonly toDate: Date;
  readonly accountNumber?: string;
  readonly symbolCode: string;
}

class RightSubscriptionsComponent extends React.Component<
  IRightSubscriptionsProps,
  IRightSubscriptionsState
> {
  private localGridApi?: GridApi;

  constructor(props: IRightSubscriptionsProps) {
    super(props);

    this.state = {
      fromDate: getDateAMonthAgo(),
      toDate: new Date(),
      accountNumber: this.props.selectedAccount?.account,
      symbolCode: 'All',
    };
  }

  componentDidMount() {
    this.queryEquityRightSubscriptions();
    this.props.i18n.on('languageChanged', this.onChangeLang);
  }

  shouldComponentUpdate(nextProps: IRightSubscriptionsProps) {
    if (this.props.selectedAccount !== nextProps.selectedAccount) {
      this.queryEquityRightSubscriptions();
    }
    return true;
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t, rightExerciseSubscriptions } = this.props;
    return (
      <div className={styles.RightSubscriptions}>
        <div className={styles.RightSubsFilter}>
          <div className={styles.RightSubsAccount}>
            <p>{t('Account No.')}</p>
            <AccountDropdown
              isForm={true}
              onChange={this.onChangeAccount}
              type={SystemType.EQUITY}
            />
          </div>
          <div className={styles.RightSubsStockSymbol}>
            <p>{t('Stock Symbol')}</p>
            <div className={styles.RightSubsSymbolPicker}>
              <SymbolSearch
                placeholder={this.state.symbolCode}
                onSymbolSearch={this.onSymbolSearch}
              />
            </div>
          </div>
          <div className={styles.RightSubsDate}>
            <p>{t('Date')}</p>
            <DateRangePicker
              onChangeStartDate={this.onChangeFromDate}
              onChangeEndDate={this.onChangeToDate}
              startDate={this.state.fromDate}
              endDate={this.state.toDate}
            />
          </div>
          <div className={styles.RightSubsQuery}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickQuery}
            >
              {t('Query')}
            </button>
          </div>
        </div>
        <SheetData
          rowData={rightExerciseSubscriptions.data}
          columnDefs={config.getColumnDefs()}
          status={rightExerciseSubscriptions.status}
          onGridReady={this.onGridReady}
          defaultColDef={config.DEFAULT_COL_DEF}
          onLoadMore={this.queryEquityRightSubscriptions}
        />
      </div>
    );
  }

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private onChangeLang = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };

  private onChangeFromDate = (date: Date) => {
    this.setState({ fromDate: date });
  };

  private onChangeToDate = (date: Date) => {
    this.setState({ toDate: date });
  };

  private onSymbolSearch = (code: string) => {
    this.setState({ symbolCode: code });
  };

  private onClickQuery = () => {
    this.queryEquityRightSubscriptions();
  };

  private onChangeAccount = (account: IAccount | string) => {
    if (isString(account)) {
      this.setState({ accountNumber: account });
    } else {
      this.setState({ accountNumber: account.account }, () => {
        this.queryEquityRightSubscriptions();
      });
    }
  };

  private queryEquityRightSubscriptions = (
    offset?: number,
    fetchCount?: number
  ) => {
    if (this.state.accountNumber != null) {
      const params: IEquityRightSubscriptionsParams = {
        accountNo: this.state.accountNumber,
        symbol: this.state.symbolCode || 'ALL',
        fromDate: formatDateToString(this.state.fromDate, 'yyyyMMdd'),
        toDate: formatDateToString(this.state.toDate, 'yyyyMMdd'),
        offset: offset || 0,
        fetchCount: fetchCount || QUERY_FETCH_COUNT,
      };
      this.props.queryRightExerciseSubscriptions(params);
    }
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  rightExerciseSubscriptions: state.equytyRightExerciseSubscriptions,
});

const mapDispatchToProps = {
  queryRightExerciseSubscriptions,
};

const RightSubscriptions = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(RightSubscriptionsComponent)
  ),
  Fallback,
  handleError
);

export default RightSubscriptions;
