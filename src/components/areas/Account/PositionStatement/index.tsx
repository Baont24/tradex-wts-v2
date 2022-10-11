import * as React from 'react';
import * as config from './config';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  AccountDropdown,
  DateRangePicker,
  Fallback,
  SheetData,
  TabTable,
} from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatDateToString } from 'utils/datetime';
import { handleError } from 'utils/common';
import { portfolioTab } from '../config';
import { queryPositionStatement } from './actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IPositionStatementProps
  extends React.ClassAttributes<PositionStatementComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly positionStatement: IState['positionStatement'];

  readonly queryPositionStatement: typeof queryPositionStatement;
}

interface IPositionStatementState {
  readonly startDate: Date;
  readonly endDate: Date;
}
class PositionStatementComponent extends React.Component<
  IPositionStatementProps,
  IPositionStatementState
> {
  private localGridApi?: GridApi;
  constructor(props: IPositionStatementProps) {
    super(props);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    this.state = {
      startDate,
      endDate,
    };
  }

  componentDidMount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
    if (this.props.selectedAccount?.type === SystemType.DERIVATIVES) {
      this.queryPositionStatement();
    }
  }

  shouldComponentUpdate(nextProps: IPositionStatementProps) {
    if (
      this.props.selectedAccount !== nextProps.selectedAccount &&
      nextProps.selectedAccount?.type === SystemType.DERIVATIVES
    ) {
      this.queryPositionStatement();
    }

    this.onChangeLang();
    return true;
  }

  componentWillUnmount() {
    this.props.i18n.off('languageChanged', this.onChangeLang);
  }

  render() {
    const { t } = this.props;

    const RenderItem = (
      <div className={styles.PositionStatementTab}>
        <div className={styles.PositionStatementFilter}>
          <span>{t('Account No.')}</span>
          <AccountDropdown isForm={true} type={SystemType.DERIVATIVES} />
          <span>{t('Date')}</span>
          <DateRangePicker
            onChangeStartDate={this.onChangeStartDate}
            onChangeEndDate={this.onChangeEndDate}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
          />
          <div className={styles.PositionStatementQuery}>
            <button
              className={globalStyles.QueryButton}
              onClick={this.onClickQuery}
            >
              {t('Query')}
            </button>
          </div>
        </div>
        <div className={styles.PositionStatementBoard}>
          <SheetData
            columnDefs={config.getColumnDefs()}
            rowData={this.props.positionStatement.data}
            status={this.props.positionStatement.status}
            hasGroupHeader={true}
            onGridReady={this.onGridReady}
            defaultColDef={config.DEFAULT_COL_DEF}
          />
        </div>
      </div>
    );

    return (
      <div className={styles.PositionStatement}>
        <TabTable
          data={portfolioTab(
            AccountRoutes.POSITION_STATEMENT,
            RenderItem,
            this.props.selectedAccount?.type
          )}
          onSelect={this.onSelect}
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

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };

  private onChangeStartDate = (date: Date) => {
    this.setState({ startDate: date });
  };

  private onChangeEndDate = (date: Date) => {
    this.setState({ endDate: date });
  };

  private onClickQuery = () => {
    this.queryPositionStatement();
  };

  private queryPositionStatement = () => {
    if (this.props.selectedAccount) {
      this.props.queryPositionStatement({
        accountNo: this.props.selectedAccount.accountNumber,
        fromDate: formatDateToString(this.state.startDate, 'yyyyMMdd') || '',
        toDate: formatDateToString(this.state.endDate, 'yyyyMMdd') || '',
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  positionStatement: state.positionStatement,
});

const mapDispatchToProps = {
  queryPositionStatement,
};

const PositionStatement = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(PositionStatementComponent)
    ),
    Fallback,
    handleError
  )
);

export default PositionStatement;
