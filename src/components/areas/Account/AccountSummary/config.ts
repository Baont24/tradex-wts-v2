import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  CellClickedEvent,
  ColDef,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IEquityEnquiryPortfolioBeanItemResponse } from 'interfaces/api';
import { IPortfoliosReducer } from 'interfaces/reducers';
import { formatNumber, multiplyBy1000 } from 'utils/common';
import AccountCell from './AccountCell';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 180,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
  flex: 1,
};

export const getColumnDefs = (
  onSymbolCellClicked?: (event: CellClickedEvent) => void,
  isIICA?: boolean,
  isAccountTypeEquity?: boolean
): Array<
  | IColGroupDef<Partial<IPortfoliosReducer>>
  | IColDef<Partial<IPortfoliosReducer>>
> => [
  {
    headerName: i18next.t('Account'),
    field: 'accountNumber',
    cellClass: `${globalStyles.Cell} ${styles.AccountCell}`,
    onCellClicked: onSymbolCellClicked,
    cellRendererFramework: AccountCell,
  },
  {
    headerName: i18next.t('Total Stock Market Value'),
    field: 'summary',
    valueGetter: (params: ValueGetterParams) =>
      formatNumber(
        (params.data as IPortfoliosReducer)?.summary?.totalStockMarketValue,
        0,
        undefined,
        false,
        '—'
      ),
    valueFormatter: (params: ValueFormatterParams) => {
      if (
        params.data.portfolioList != null &&
        params.data.portfolioList.length > 0
      ) {
        const marketValue = params.data.portfolioList.reduce(
          (
            val: IEquityEnquiryPortfolioBeanItemResponse,
            curr: IEquityEnquiryPortfolioBeanItemResponse
          ) => {
            return {
              marketValue: val.marketValue + curr.marketValue,
            };
          },
          {
            marketValue: 0,
          }
        );
        return formatNumber(marketValue.marketValue);
      } else {
        return '0';
      }
    },
  },
  {
    headerName: i18next.t('Daily P/L'),
    field: 'summary',
    valueGetter: (params: ValueGetterParams) =>
      formatNumber((params.data as IPortfoliosReducer)?.summary?.dailyPL),
  },
  {
    headerName: i18next.t('Cash Balance 2'),
    field: 'summary',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IPortfoliosReducer)?.summary?.cashBalance ?? '—',
    hide: true,
  },
  {
    headerName: i18next.t('Liability'),
    field: 'summary',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IPortfoliosReducer)?.summary?.liability ?? '—',
    hide: true,
  },
  {
    headerName: i18next.t('Net Asset Value (total equity)'),
    field: 'summary',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IPortfoliosReducer)?.summary?.netAssetValue,
    valueFormatter: (params: ValueFormatterParams) =>
      isIICA && isAccountTypeEquity
        ? formatNumber(
            multiplyBy1000(
              (params.data as IPortfoliosReducer)?.summary?.netAssetValue
            )
          )
        : formatNumber(
            (params.data as IPortfoliosReducer)?.summary?.netAssetValue
          ),
  },
  {
    headerName: i18next.t('PP'),
    field: 'summary',
    valueGetter: (params: ValueGetterParams) =>
      (params.data as IPortfoliosReducer)?.summary?.PP,
    valueFormatter: (params: ValueFormatterParams) =>
      isIICA && isAccountTypeEquity
        ? formatNumber(
            multiplyBy1000((params.data as IPortfoliosReducer)?.summary?.PP),
            0,
            undefined,
            false,
            '—'
          )
        : formatNumber(
            (params.data as IPortfoliosReducer)?.summary?.PP,
            0,
            undefined,
            false,
            '—'
          ),
  },
];
