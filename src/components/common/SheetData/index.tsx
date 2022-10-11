import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { AgGridReact } from 'ag-grid-react';
import {
  BodyScrollEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  RowHeightParams,
  RowNode,
  RowSelectedEvent,
} from 'ag-grid-community';
import { IColDef, IColGroupDef, IQueryStatus } from 'interfaces/common';
// import { QUERY_FETCH_COUNT } from 'constants/main';
import { translateLocaleText } from 'utils/common';
import config from 'config';
import i18next from 'i18next';

export interface ISheetDataProps<T>
  extends React.ClassAttributes<SheetDataComponent<T>> {
  readonly hasGroupHeader?: boolean;
  readonly columnDefs?: Array<IColDef<T> | IColGroupDef<T>>;
  readonly rowData?: T[];
  readonly lastRowData?: Array<Partial<T>> | any[];
  readonly firstRowData?: Array<Partial<T>> | any[];
  readonly fullWidthCellRendererFramework?: React.ReactNode;
  readonly defaultColDef?: ColDef;
  readonly domLayout?: string;
  readonly rowSelection?: 'single' | 'multiple';
  readonly rowDeselection?: boolean;
  readonly rowMultiSelectWithClick?: boolean;
  readonly suppressRowClickSelection?: boolean;
  readonly movableColumns?: boolean;
  readonly fetchCount?: number;
  readonly status?: IQueryStatus;

  readonly isFullWidthCell?: (rowNode: RowNode) => boolean;
  readonly sheetDataRef?: (ref: SheetDataComponent<T>) => void;
  readonly onGridReady?: (event: GridReadyEvent) => void;
  readonly onRowClicked?: (event: RowClickedEvent) => void;
  readonly getRowHeight?: (rowNode: RowHeightParams) => number;
  readonly getRowNodeId?: (data: T) => string;
  readonly onRowSelected?: (event: RowSelectedEvent) => void;
  readonly isRowSelectable?: (node: RowNode) => boolean;
  readonly onLoadMore?: (offset?: number, fetchCount?: number) => void;
}

export default class SheetDataComponent<T> extends React.Component<
  ISheetDataProps<T>
> {
  private localGridApi?: GridApi;

  constructor(props: ISheetDataProps<T>) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps: ISheetDataProps<T>) {
    if (
      prevProps.status != null &&
      this.props.status != null &&
      prevProps.status !== this.props.status
    ) {
      if (prevProps.status.isLoading !== this.props.status.isLoading) {
        if (this.props.status.isLoading) {
          this.localGridApi?.showLoadingOverlay();
        } else {
          this.localGridApi?.hideOverlay();
        }
      }

      if (prevProps.status.isFailed !== this.props.status.isFailed) {
        if (this.props.status.isFailed) {
          this.localGridApi?.showNoRowsOverlay();
        } else {
          this.localGridApi?.hideOverlay();
        }
      }

      if (
        prevProps.status.isSucceeded !== this.props.status.isSucceeded &&
        this.props.status.isSucceeded
      ) {
        this.localGridApi?.hideOverlay();
        if (this.props.rowData?.length === 0) {
          this.localGridApi?.showNoRowsOverlay();
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeGrid);
  }

  render() {
    const overlayNoRowsTemplate =
      this.props.status?.isFailed && this.props.status.errorMessage != null
        ? `<span class="ag-overlay-loading-center text-left d-flex align-items-center" style="max-width: 300px;">
        <span class="mr-2">
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="Down" size="17" height="17" width="17" xmlns="http://www.w3.org/2000/svg"><path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg>
        </span>
          <span class="flex-grow-1">${i18next.t(
            this.props.status.errorMessage
          )}</span>
        </span>`
        : undefined;

    return (
      <div
        className={classNames(styles.SheetData, 'ag-theme-balham-dark', {
          [styles.TableHasGroupHeader]: this.props.hasGroupHeader,
          [styles.TableNoGroupHeader]: !this.props.hasGroupHeader,
        })}
      >
        <AgGridReact
          rowData={this.props.rowData}
          onGridReady={this.onGridReady}
          columnDefs={this.props.columnDefs}
          localeTextFunc={translateLocaleText}
          headerHeight={25.5}
          rowHeight={26}
          enableCellExpressions={true}
          suppressDragLeaveHidesColumns={true}
          rowBuffer={0}
          suppressHorizontalScroll={false}
          pinnedBottomRowData={this.props.lastRowData}
          pinnedTopRowData={this.props.firstRowData}
          onRowClicked={this.props.onRowClicked}
          fullWidthCellRendererFramework={
            this.props.fullWidthCellRendererFramework
          }
          isFullWidthCell={this.props.isFullWidthCell}
          getRowHeight={this.props.getRowHeight}
          defaultColDef={this.props.defaultColDef}
          domLayout={this.props.domLayout}
          getRowNodeId={this.props.getRowNodeId}
          rowSelection={this.props.rowSelection}
          rowDeselection={this.props.rowDeselection}
          rowMultiSelectWithClick={this.props.rowMultiSelectWithClick}
          onRowSelected={this.props.onRowSelected}
          isRowSelectable={this.props.isRowSelectable}
          suppressRowClickSelection={this.props.suppressRowClickSelection}
          suppressMovableColumns={!this.props.movableColumns}
          onBodyScroll={this.onGridScroll}
          stopEditingWhenCellsLoseFocus={true}
          overlayNoRowsTemplate={overlayNoRowsTemplate}
          suppressScrollOnNewData={true}
        />
      </div>
    );
  }

  private onGridReady = (event: GridReadyEvent) => {
    event.api.sizeColumnsToFit();
    if (this.props.status?.isLoading) {
      event.api.showLoadingOverlay();
    }
    this.localGridApi = event.api;
    window.addEventListener('resize', this.resizeGrid);

    this.props.onGridReady?.(event);
  };

  private resizeGrid = () => {
    setTimeout(() => {
      this.localGridApi?.sizeColumnsToFit();
    });
  };

  private onGridScroll = (ev: BodyScrollEvent) => {
    if (!this.props.status?.isLoading && this.props.status?.loadMore) {
      const lastDisplayedIndex = ev.api.getLastDisplayedRow();
      const rowCount = ev.api.getModel().getRowCount();
      const fetchCount = this.props.fetchCount || config.fetchCount;
      if (rowCount >= config.fetchCount && lastDisplayedIndex >= rowCount - 5) {
        this.props.onLoadMore?.(rowCount, fetchCount);
      }
    }
  };
}
