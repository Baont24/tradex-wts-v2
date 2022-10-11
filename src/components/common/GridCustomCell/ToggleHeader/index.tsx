import * as React from 'react';
import * as styles from './styles.scss';
import {
  ColDef,
  Column,
  ColumnApi,
  GridApi,
  IHeaderParams,
} from 'ag-grid-community';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { IHeaderReactComp } from 'ag-grid-react';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from 'components/common/Fallback';

interface IToggleHeaderProps {
  readonly displayName: string;
  readonly column: Column;
  readonly columnApi: ColumnApi;
  readonly api: GridApi;
}

class ToggleHeader extends React.Component<
  IToggleHeaderProps,
  IHeaderReactComp
> {
  private localSortState?: string | null;

  constructor(props: IToggleHeaderProps) {
    super(props);

    this.state = { refresh: (params: IHeaderParams) => true };
  }

  render() {
    const sortable = (this.props.column.getDefinition() as ColDef).sortable;
    const sortModels = this.props.columnApi.getColumnState();

    const currentColumn = sortModels.find(
      (val) => val.colId === this.props.column.getUniqueId()
    );
    if (sortModels.length > 0 && currentColumn) {
      this.localSortState = currentColumn.sort;
    }

    return (
      <div
        className={`${styles.ToggleHeader} ${
          sortable === true ? styles.Clickable : ''
        }`}
        {...(sortable === true && { onClick: this.onSort })}
      >
        <FaCaretLeft onClick={this.onToggle} />
        {this.props.displayName}
        {this.localSortState != null && (
          <div
            className={`ag-icon ${
              this.localSortState === 'asc' ? 'ag-icon-asc' : 'ag-icon-desc'
            }`}
          />
        )}
        <FaCaretRight onClick={this.onToggle} />
      </div>
    );
  }

  private onToggle = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.stopPropagation();
    const columnGroupStates = this.props.columnApi.getColumnGroupState();

    const columnGroupState = columnGroupStates.find(
      (item) =>
        item.groupId ===
        this.props.column.getParent().getOriginalColumnGroup().getGroupId()
    );
    if (columnGroupState) {
      this.props.columnApi.setColumnGroupOpened(
        this.props.column.getParent().getOriginalColumnGroup(),
        !columnGroupState.open
      );
      this.props.api.refreshHeader();
      this.props.columnApi.resetColumnState();
    }
  };

  private onSort = () => {
    this.props.column.setColDef(
      {
        ...this.props.column.getColDef(),
        sort:
          this.localSortState === 'asc'
            ? 'desc'
            : this.localSortState === 'desc'
            ? null
            : 'asc',
      },
      null
    );
    this.props.columnApi.resetColumnState();

    this.props.api.refreshHeader();
  };
}

export default withErrorBoundary(ToggleHeader, Fallback, handleError);
