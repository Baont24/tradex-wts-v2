import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { IColDef, IColGroupDef } from 'interfaces/common';
import { IEquityRightSubscriptionsResponse } from 'interfaces/api';
import { formatDateToDisplay } from 'utils/datetime';
import { formatNumber } from 'utils/common';
import i18next from 'i18next';

export const DEFAULT_COL_DEF: ColDef = {
  minWidth: 70,
  headerClass: globalStyles.Header,
  cellClass: globalStyles.Cell,
  suppressMovable: true,
};

export const formatNumberHaveSlash = (val?: number | string) => {
  if (typeof val === 'string' && val.indexOf(':')) {
    const locationSlash = val.indexOf(':');
    const stringCut = val.slice(0, locationSlash);
    return `${formatNumber(Number(stringCut), 5)} : ${formatNumber(
      Number(val.slice(locationSlash + 1)),
      5
    ).toString()}`;
  } else {
    return formatNumber(Number(val));
  }
};

export const getColumnDefs = (): Array<
  | IColGroupDef<IEquityRightSubscriptionsResponse>
  | IColDef<IEquityRightSubscriptionsResponse>
> => [
  {
    headerName: i18next.t('Symbol'),
    field: 'symbol',
    minWidth: 100,
    maxWidth: 100,
    cellClass: `${globalStyles.Cell} ${styles.alignCenter}`,
  },
  {
    headerName: i18next.t('Right Type'),
    field: 'rightType',
    cellClass: `${globalStyles.Cell} ${styles.alignEnd}`,
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
  {
    headerName: i18next.t('Closed Date'),
    field: 'closedDate',
    cellClass: `${globalStyles.Cell} ${styles.alignCenter}`,
    valueFormatter: (params: ValueFormatterParams) => {
      const date = formatDateToDisplay(
        (params.data as IEquityRightSubscriptionsResponse)?.closedDate
      );
      if (date !== null) {
        return date;
      } else {
        return '—';
      }
    },
  },
  {
    headerName: i18next.t('Excercise Date'),
    field: 'exerciseDate',
    cellClass: `${globalStyles.Cell} ${styles.alignCenter}`,
    valueFormatter: (params: ValueFormatterParams) => {
      const date = formatDateToDisplay(
        (params.data as IEquityRightSubscriptionsResponse)?.exerciseDate
      );
      if (date !== null) {
        return date;
      } else {
        return '—';
      }
    },
  },
  {
    headerName: i18next.t('Qty at closed Date'),
    field: 'qtyAtClosedDate',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightSubscriptionsResponse)?.qtyAtClosedDate
      ),
  },
  {
    headerName: i18next.t('Ratio'),
    field: 'ratio',
    valueFormatter: (params: ValueFormatterParams) => {
      const ratio = formatNumberHaveSlash(
        (params.data as IEquityRightSubscriptionsResponse)?.ratio
      );
      return typeof ratio === 'string'
        ? ratio
        : formatNumber(
            (params.data as IEquityRightSubscriptionsResponse)?.ratio
          );
    },
  },
  {
    headerName: i18next.t('Receivable Cash'),
    field: 'receivableCash',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightSubscriptionsResponse)?.receivableCash,
        0,
        undefined,
        false,
        '—'
      ),
  },
  {
    headerName: i18next.t('Right Stock 1'),
    field: 'parValue',
    cellClass: `${globalStyles.Cell} ${styles.alignCenter}`,
  },
  {
    headerName: i18next.t('Receivable Qty'),
    field: 'receivableQty',
    valueFormatter: (params: ValueFormatterParams) =>
      formatNumber(
        (params.data as IEquityRightSubscriptionsResponse)?.receivableQty
      ),
  },
  {
    headerName: i18next.t('Status'),
    field: 'status',
    cellClass: `${globalStyles.Cell} ${styles.alignEnd}`,
    valueFormatter: (params: ValueFormatterParams) => i18next.t(params.value),
  },
];
