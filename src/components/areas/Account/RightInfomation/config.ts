import * as globalStyles from 'styles/style.scss';
import {
  CellClickedEvent,
  ColDef,
  ValueFormatterParams,
} from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import {
  IEquityRightInformationResponse,
  IEquityRightSubsHistoryResponse,
} from 'interfaces/api';
import { IconRejectStatusTooltip } from 'components/common';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import RegisterBtnCell from './RegisterBtnCell';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 70,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const rightInforColumnDefs = (
  registerBtnCellClicked?: (event: CellClickedEvent) => void
): Array<
  | IColGroupDef<IEquityRightInformationResponse>
  | IColDef<IEquityRightInformationResponse>
> => [
  {
    headerName: i18next.t('Symbol'),
    field: 'symbol',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
  },
  {
    headerName: i18next.t('Ratio'),
    field: 'ratioLeft',
    minWidth: 160,
    maxWidth: 160,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    valueFormatter: (params: ValueFormatterParams) =>
      `${formatNumber(
        (params.data as IEquityRightInformationResponse)?.ratioLeft,
        5
      )} : ${formatNumber(
        (params.data as IEquityRightInformationResponse)?.ratioRight,
        5,
        undefined,
        false,
        '—'
      )} `,
  },
  {
    headerName: i18next.t('Offering Price'),
    field: 'offeringPrice',
    minWidth: 60,
    maxWidth: 60,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} `,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightInformationResponse)?.offeringPrice,
        2
      ),
  },
  {
    headerName: i18next.t('Last Transfer Date'),
    field: 'lastTransferDateLeft',
    minWidth: 160,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}  text-center `,
    valueFormatter: (params: ValueFormatterParams) => {
      const date = `${formatDateToDisplay(
        (params.data as IEquityRightInformationResponse)?.lastTransferDateLeft
      )} — ${formatDateToDisplay(
        (params.data as IEquityRightInformationResponse)?.lastTransferDateRight
      )}`;
      return date ?? '—';
    },
  },
  {
    headerName: i18next.t('Closed Date'),
    field: 'closedDate',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    valueFormatter: (params: ValueFormatterParams) => {
      const date = formatDateToDisplay(
        (params.data as IEquityRightInformationResponse)?.closedDate
      );
      return date ?? '—';
    },
  },
  {
    headerName: i18next.t('Last Registration Date'),
    field: 'lastRegistrationDateLeft',
    minWidth: 160,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    valueFormatter: (params: ValueFormatterParams) => {
      const date = `${formatDateToDisplay(
        (params.data as IEquityRightInformationResponse)
          ?.lastRegistrationDateLeft
      )} — ${formatDateToDisplay(
        (params.data as IEquityRightInformationResponse)
          ?.lastRegistrationDateRight
      )}`;
      return date ?? '—';
    },
  },
  {
    headerName: i18next.t('Qty at closed Date'),
    field: 'qtyAtClosedDate',
    minWidth: 100,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value),
  },
  {
    headerName: i18next.t('Initial Right Qty 1'),
    field: 'initialRightQty',
    minWidth: 100,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} `,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightInformationResponse)?.initialRightQty,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Available Right Qty'),
    field: 'availableRightQty',
    minWidth: 100,
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightInformationResponse)?.availableRightQty
      ),
  },
  {
    headerName: i18next.t('Amount'),
    field: 'amount',
    minWidth: 100,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber((params.data as IEquityRightInformationResponse)?.amount),
  },
  {
    headerName: i18next.t('Registed Qty'),
    field: 'registeredQty',
    minWidth: 100,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightInformationResponse)?.registeredQty,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Purchased Amount'),
    field: 'purchaseAmount',
    minWidth: 100,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightInformationResponse)?.purchaseAmount,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Status'),
    field: 'status',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
    cellRendererFramework: IconRejectStatusTooltip,
  },
  {
    headerName: i18next.t('Register'),
    maxWidth: 90,
    minWidth: 90,
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    onCellClicked: registerBtnCellClicked,
    cellRendererFramework: RegisterBtnCell,
  },
];

export const rightSubsColumnDefs = (): Array<
  | IColGroupDef<IEquityRightSubsHistoryResponse>
  | IColDef<IEquityRightSubsHistoryResponse>
> => [
  {
    headerName: i18next.t('Registered Time'),
    field: 'registeredTime',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    minWidth: 145,
  },
  {
    headerName: i18next.t('Symbol'),
    field: 'symbol',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
  },
  {
    headerName: i18next.t('Ratio'),
    field: 'ratio',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    hide: true,
  },
  {
    headerName: i18next.t('Offering Price'),
    field: 'offeringPrice',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} `,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightInformationResponse)?.offeringPrice,
        2
      ),
  },
  {
    headerName: i18next.t('Closed Date'),
    field: 'closedDate',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    minWidth: 145,
    valueFormatter: (params: ValueFormatterParams) => {
      const date = formatDateToDisplay(
        (params.data as IEquityRightSubsHistoryResponse)?.closedDate
      );
      return date ?? '—';
    },
    hide: true,
  },
  {
    headerName: i18next.t('Last Registration Date'),
    field: 'lastRegistrationDate',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-center `,
    minWidth: 145,
    hide: true,
  },
  {
    headerName: i18next.t('Registered Qty 1'),
    field: 'registeredQty',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} `,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightInformationResponse)?.registeredQty,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Purchased Amount'),
    field: 'purchasedAmount',
    headerClass: globalStyles.Header,
    cellClass: globalStyles.Cell,
    minWidth: 100,
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightSubsHistoryResponse)?.purchasedAmount,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Execute Date'),
    field: 'executeDate',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell}`,
    valueFormatter: (params: ValueFormatterParams) => {
      const date = formatDateToDisplay(
        (params.data as IEquityRightSubsHistoryResponse)?.executeDate
      );
      return date ?? '—';
    },
  },
  {
    headerName: i18next.t('Status'),
    field: 'status',
    headerClass: globalStyles.Header,
    cellClass: `${globalStyles.Cell} text-left `,
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
  },
  // {
  //   headerName: i18next.t('Cancel'),
  //   maxWidth: 90,
  //   minWidth: 90,
  //   headerClass: globalStyles.Header,
  //   cellClass: `${globalStyles.Cell}`,
  //   cellRendererFramework: CancelBtnCell,
  // },
];
