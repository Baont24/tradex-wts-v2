import * as React from 'react';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
  ValueParserParams,
} from 'ag-grid-community';
import { EditableCallbackParams } from 'ag-grid-community/dist/lib/entities/colDef';
import { IColDef, IColGroupDef } from 'interfaces/common';
import {
  IStockTransferHistoryResponse,
  IStockTransferResponse,
} from 'interfaces/api';
import { formatNumber } from 'utils/common';
import { formatTimeToDisplay } from 'utils/datetime';
import i18next from 'i18next';

export interface IStockTransferBoard extends IStockTransferResponse {
  readonly transferVolume?: number;
}

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 180,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const stockTransferColumnDefs = (): Array<
  IColDef<IStockTransferBoard> | IColGroupDef<IStockTransferBoard>
> => [
  {
    colId: 'checkbox',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
    headerName: '',
    minWidth: 30,
    maxWidth: 30,
    suppressSizeToFit: true,
  },
  {
    colId: 'no',
    headerName: i18next.t('No.'),
    minWidth: 50,
    maxWidth: 50,
    suppressSizeToFit: true,
    valueFormatter: (params: ValueFormatterParams) =>
      String(params?.node?.rowIndex ? params?.node?.rowIndex + 1 : 1),
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Stock Symbol'),
    field: 'stockSymbol',
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Stock Type'),
    field: 'stockType',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
  {
    headerName: i18next.t('Available Volume'),
    field: 'availableVolume',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value),
  },
  {
    headerName: i18next.t('Transfer value MAS'),
    field: 'transferVolume',
    singleClickEdit: true,
    cellClass: [globalStyles.Cell],
    editable: (params: EditableCallbackParams) => {
      return params.node.isSelected() || false;
    },
    valueParser: (params: ValueParserParams) => {
      let newValue =
        params.newValue > params.data.availableVolume
          ? params.data.availableVolume
          : params.newValue;
      return +newValue || undefined;
    },
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(params.value, 2, undefined, undefined, ''),
    cellRendererFramework: (props: ICellRendererParams) => {
      return (
        <div className={styles.TransferVolumeCell}>{props.valueFormatted}</div>
      );
    },
  },
];

export const stockTransferHistoryColumnDefs = (): Array<
  | IColDef<IStockTransferHistoryResponse>
  | IColGroupDef<IStockTransferHistoryResponse>
> => [
  {
    colId: 'no',
    headerName: i18next.t('No.'),
    minWidth: 50,
    maxWidth: 50,
    valueFormatter: (params: ValueFormatterParams) =>
      String(params?.node?.rowIndex ? params?.node?.rowIndex + 1 : 1),
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Symbol'),
    field: 'symbol',
    cellClass: [globalStyles.Cell, 'text-center'],
  },
  {
    headerName: i18next.t('Stock Type'),
    field: 'stockType',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
  {
    headerName: i18next.t('Request Time'),
    field: 'requestTime',
    cellClass: `${globalStyles.Cell} text-center `,
    valueFormatter: (params: ValueFormatterParams) =>
      formatTimeToDisplay(
        params.value,
        'HH:mm:ss dd/MM/yyyy',
        'yyyyMMddHHmmss',
        true
      ) || '',
  },
  {
    headerName: i18next.t('Sender Account'),
    field: 'senderAccount',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
    hide: true,
  },
  {
    headerName: i18next.t('Receiver Account'),
    field: 'receiverAccount',
    cellClass: [globalStyles.Cell, 'text-center'],
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '—',
    hide: true,
  },
  {
    headerName: i18next.t('Volume'),
    field: 'volume',
    valueFormatter: (params: ValueFormatterParams) =>
      params.value ? formatNumber(params.value) : '—',
  },
  {
    headerName: i18next.t('Status'),
    field: 'status',
    cellClass: `${globalStyles.Cell} text-center `,
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
];
