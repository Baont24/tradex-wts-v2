import * as React from 'react';
import * as config from './config';
import * as styles from './styles.scss';
import { AccountRoutes, Routes } from 'constants/routes';
import { Fallback, SheetData } from 'components/common';
import { ICellRendererParams } from 'ag-grid-community';
import {
  IDrAccountOpenPositionItem,
  IEquityEnquiryPortfolioBeanItemResponse,
} from 'interfaces/api';
import { IPortfoliosReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeAccount } from 'redux/global-actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface IPortfolioRowProps extends ICellRendererParams, WithNamespaces {
  readonly accountList: IState['accountList'];

  readonly changeAccount: typeof changeAccount;
}

class PortfolioRowComponent extends React.Component<IPortfolioRowProps> {
  constructor(props: IPortfolioRowProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t } = this.props;

    const data: IPortfoliosReducer = this.props.data;

    let columnDefs: any[] = config.getColumnDefs();
    let lastRowData: any = (data.portfolioList as IEquityEnquiryPortfolioBeanItemResponse[])?.reduce(
      (val, curr) => {
        const valueUnrealizedPL =
          val.unrealizedPLValue + curr.unrealizedPLValue;
        const totalValue = val.value + curr.value;
        return {
          symbol: t('TOTAL 2'),
          awaitTrading: val.awaitTrading + curr.awaitTrading,
          avgPrice: val.avgPrice + curr.avgPrice,
          value: val.value + curr.value,
          marketValue: val.marketValue + curr.marketValue,
          unrealizedPLValue: val.unrealizedPLValue + curr.unrealizedPLValue,
          unrealizedPLPercent: (valueUnrealizedPL / totalValue) * 100,
        };
      },
      {
        symbol: t('TOTAL 2'),
        awaitTrading: 0,
        avgPrice: 0,
        value: 0,
        marketValue: 0,
        unrealizedPLValue: 0,
        unrealizedPLPercent: 0,
      }
    );

    if (data.type === SystemType.DERIVATIVES) {
      columnDefs = config.getDrColumnDefs();
      lastRowData = (data.portfolioList as IDrAccountOpenPositionItem[])?.reduce(
        (val, curr) => ({
          seriesID: t('TOTAL 2'),
          floatingPL: val.floatingPL + curr.floatingPL,
        }),
        {
          seriesID: t('TOTAL 2'),
          floatingPL: 0,
        }
      );
    }

    return (
      <div className={styles.PortfolioRow}>
        <div className={styles.LinkItem}>
          <Link
            to={`/${Routes.ACCOUNT}/${AccountRoutes.PORTFOLIO}`}
            onClick={this.onLinkClick}
          >
            {t('View Portfolio Detail')}
          </Link>
          <Link
            to={`/${Routes.ACCOUNT}/${AccountRoutes.ASSET_MANAGEMENT}`}
            onClick={this.onLinkClick}
          >
            {t('View Asset Detail')}
          </Link>
        </div>
        <div className={styles.PortfolioData}>
          <SheetData
            rowData={(data?.portfolioList as any[]) || []}
            columnDefs={columnDefs}
            status={this.props.data.status}
            lastRowData={[lastRowData]}
            defaultColDef={config.DEFAULT_COL_DEF}
          />
        </div>
      </div>
    );
  }

  private onLinkClick = () => {
    const account = this.props.accountList.find(
      (val) =>
        val.accountNumber ===
        (this.props.data as IPortfoliosReducer).accountNumber
    );
    if (account) {
      this.props.changeAccount(account);
    }
  };
}

const mapStateToProps = (state: IState) => ({
  accountList: state.accountList,
});

const mapDispatchToProps = {
  changeAccount,
};

const PortfolioRow = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(PortfolioRowComponent)
  ),
  Fallback,
  handleError
);

export default PortfolioRow;
