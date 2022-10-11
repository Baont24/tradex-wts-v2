import * as globalStyles from 'styles/style.scss';
import { ColDef, RowClickedEvent } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { ILoanContractResponse } from 'interfaces/api';
import ButtonDetail from './ButtonDetail';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const getColumnDefs = (
  onClickRow?: (e: RowClickedEvent) => void
): Array<
  IColGroupDef<ILoanContractResponse> | IColDef<ILoanContractResponse>
> => [
  {
    headerName: i18next.t('No.'),
    field: 'no',

    maxWidth: 90,
  },
  {
    headerName: i18next.t('Effective Date'),
    field: 'date',
  },
  {
    headerName: i18next.t('Initial Loan'),
    field: 'beginningOutstandingLoan',
  },
  {
    headerName: i18next.t('Paid Amount'),
    field: 'newDebtIncrease',
  },
  {
    headerName: i18next.t('Outstanding Loan'),
    field: 'paidAmountDecrease',
  },
  {
    headerName: i18next.t('Due Date'),
    field: 'totalDebt',
  },
  {
    headerName: i18next.t('Status'),
    field: 'marginCall',
  },
  {
    headerName: i18next.t('Description'),
    field: 'forceSell',
  },
  {
    headerName: i18next.t('View Detail'),
    cellRendererFramework: ButtonDetail,
    cellRendererParams: {
      onClickRow,
    },
  },
];

export const getModalColumnDefs = (): Array<
  IColGroupDef<ILoanContractResponse> | IColDef<ILoanContractResponse>
> => [
  {
    headerName: i18next.t('No.'),
    field: 'no',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    maxWidth: 90,
  },
  {
    headerName: i18next.t('Effective Date'),
    field: 'date',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
  },
  {
    headerName: i18next.t('Pay Date'),
    field: 'newDebtIncrease',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
  },
  {
    headerName: i18next.t('Paid Amount'),
    field: 'newDebtIncrease',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
  },
];
