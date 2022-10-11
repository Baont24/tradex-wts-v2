import * as React from 'react';
import * as styles from './styles.scss';
import {
  ColDef,
  ColumnApi,
  ColumnGroup,
  GridApi,
  IHeaderParams,
} from 'ag-grid-community';
import { ColumnGroupChild } from 'ag-grid-community/dist/lib/entities/columnGroupChild';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { IHeaderReactComp } from 'ag-grid-react';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from 'components/common/Fallback';

interface IToggleGroupHeaderProps {
  readonly displayName: string;
  readonly columnGroup: ColumnGroup;
  readonly columnApi: ColumnApi;
  readonly api: GridApi;
  readonly staticHeader: boolean;
  readonly iconHeader: boolean;
}

class ToggleGroupHeader extends React.Component<
  IToggleGroupHeaderProps,
  IHeaderReactComp
> {
  static defaultProps = {
    staticHeader: true,
    iconHeader: true,
  };

  private localColumn?: ColumnGroupChild;
  private localSortState?: string | null;

  constructor(props: IToggleGroupHeaderProps) {
    super(props);

    this.state = { refresh: (params: IHeaderParams) => true };
  }

  render() {
    const displayedChildren = this.props.columnGroup.getDisplayedChildren();

    if (displayedChildren?.length || 1 > 0) {
      this.localColumn = displayedChildren?.[0];
      const sortable = (this.localColumn?.getDefinition() as ColDef).sortable;
      const groupSortable = (this.props.columnGroup.getDefinition() as ColDef)
        .sortable;

      const sortModels = this.props.columnApi.getColumnState();
      const currentColumn = sortModels.find(
        (val) => val.colId === this.localColumn?.getUniqueId()
      );
      if (sortModels.length > 0 && currentColumn) {
        this.localSortState = currentColumn.sort;
      }

      return (
        <div
          className={`${styles.ToggleGroupHeader} ${
            sortable === true && groupSortable === true ? styles.Clickable : ''
          }`}
          {...(sortable === true &&
            groupSortable === true && { onClick: this.onSort })}
        >
          {this.props.iconHeader === true ? (
            <div className={styles.Content}>
              <FaCaretLeft onClick={this.onToggle} />
              <span>
                {this.props.staticHeader !== true
                  ? this.localColumn?.getDefinition()?.headerName
                  : this.props.displayName}
              </span>
              {this.localSortState != null && (
                <div
                  className={`ag-icon ${
                    this.localSortState === 'asc'
                      ? 'ag-icon-asc'
                      : 'ag-icon-desc'
                  }`}
                />
              )}
              <FaCaretRight onClick={this.onToggle} />
            </div>
          ) : (
            <div>
              <span>{this.props.displayName}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  private onToggle = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.stopPropagation();

    const columnGroupStates = this.props.columnApi.getColumnGroupState();

    const columnGroupState = columnGroupStates.find(
      (item) =>
        item.groupId === this.props.columnGroup.getOriginalColumnGroup().getId()
    );
    if (columnGroupState) {
      this.props.columnApi.setColumnGroupOpened(
        this.props.columnGroup.getOriginalColumnGroup(),
        !columnGroupState.open
      );
      this.props.api.refreshHeader();
      this.props.columnApi.resetColumnState();
    }
  };

  private onSort = () => {
    this.props.columnApi.setColumnState([
      {
        colId: this.localColumn?.getUniqueId(),
        sort:
          this.localSortState === 'asc'
            ? 'desc'
            : this.localSortState === 'desc'
            ? null
            : 'asc',
      },
    ]);

    this.props.api.refreshHeader();
  };
}

export default withErrorBoundary(ToggleGroupHeader, Fallback, handleError);
