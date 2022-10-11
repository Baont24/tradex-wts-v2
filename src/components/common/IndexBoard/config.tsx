// import * as React from 'react';
import * as styles from './styles.scss';
import { IColDef, IColGroupDef, PropType } from 'interfaces/common';
import { INewSymbolData } from 'interfaces/market';
import {
  indexRules,
  priceFormatter,
  quantityFormatter,
  rateFormatter,
  tradingValueFormatter,
} from 'utils/board';
// import { TimeSVG } from 'assets/svg';
import ToggleGroupHeader from 'components/common/GridCustomCell/ToggleGroupHeader';
import UpDownCellRender from './UpDownCell';
import i18next from 'i18next';

export const getColumnDefs = (
  indexType: PropType<INewSymbolData, 'it'>
): Array<IColGroupDef<INewSymbolData> | IColDef<INewSymbolData>> => [
  {
    headerName: i18next.t('Index'),
    field: 'n1',
    minWidth: 80,
    maxWidth: 120,
    headerClass: styles.Header,
    cellClass: `${styles.Cell} ${styles.Index}`,
    cellClassRules: indexRules,
  },
  {
    headerName: i18next.t('Price'),
    field: 'c',
    minWidth: 60,
    maxWidth: indexType === 'D' ? 70 : 120,
    headerClass: styles.Header,
    cellClass: styles.Cell,
    cellClassRules: indexRules,
    valueFormatter: priceFormatter,
  },
  {
    headerName: i18next.t('Trading'),
    headerGroupComponentFramework: ToggleGroupHeader,
    headerGroupComponentParams: {
      staticHeader: false,
    },
    headerClass: styles.ShowOnlyToggleGroupHeader,
    sortable: true,
    children: [
      {
        headerName: i18next.t('+/-'),
        field: 'ch',
        minWidth: 50,
        maxWidth: 50,
        headerClass: styles.NoGroupHeader,
        cellClass: styles.Cell,
        columnGroupShow: 'closed',
        valueFormatter: priceFormatter,
        cellClassRules: indexRules,
        hide: indexType === 'F',
      },
      {
        headerName: i18next.t('%'),
        field: 'ra',
        minWidth: 50,
        maxWidth: 50,
        headerClass: styles.NoGroupHeader,
        cellClass: styles.Cell,
        columnGroupShow: 'open',
        valueFormatter: rateFormatter,
        cellClassRules: indexRules,
        hide: indexType === 'F',
      },
    ],
  },
  {
    headerName: i18next.t('+/-'),
    field: 'ch',
    minWidth: 50,
    maxWidth: 100,
    headerClass: styles.Header,
    cellClass: styles.Cell,
    valueFormatter: priceFormatter,
    cellClassRules: indexRules,
    hide: indexType === 'D',
  },
  {
    headerName: i18next.t('%'),
    field: 'ra',
    minWidth: 50,
    maxWidth: 100,
    headerClass: styles.Header,
    cellClass: styles.Cell,
    valueFormatter: rateFormatter,
    cellClassRules: indexRules,
    hide: indexType === 'D',
  },
  {
    headerName: i18next.t('Vol'),
    field: 'vo',
    minWidth: 80,
    maxWidth: 100,
    headerClass: styles.Header,
    cellClass: styles.Cell,
    valueFormatter: quantityFormatter,
    hide: indexType === 'F',
  },
  {
    headerName: `${i18next.t('Val')} (${i18next.t('mils')})`,
    field: 'va',
    minWidth: 80,
    maxWidth: 100,
    headerClass: styles.Header,
    cellClass: styles.Cell,
    valueFormatter: tradingValueFormatter,
    hide: indexType === 'F',
  },
  {
    headerName: i18next.t('Up/Down'),
    field: 'ic',
    minWidth: 135,
    maxWidth: 135,
    headerClass: styles.Header,
    cellClass: styles.Cell,
    cellRendererFramework: UpDownCellRender,
    hide: true,
  },
  // {
  //   headerName: i18next.t('Time'),
  //   width: 26,
  //   headerClass: styles.Header,
  //   cellClass: styles.Cell,
  //   suppressSizeToFit: true,
  //   cellRendererFramework: () => (
  //     <div className={styles.TimeCell}>
  //       <TimeSVG />
  //     </div>
  //   ),
  // },
];
