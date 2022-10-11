import * as React from 'react';
import * as styles from './styles.scss';
import { BoardKey } from 'interfaces/common';
import { ICellRendererParams, RowNode } from 'ag-grid-community';
import { INewSymbolData } from 'interfaces/market';
import { SpeedOrderClickType } from 'constants/enum';
import { domainConfig } from 'config/domain';
import classNames from 'classnames';
import config from 'config';

interface ISymbolCellProps extends ICellRendererParams {
  readonly boardKey: BoardKey;
  readonly data: INewSymbolData;

  readonly onRemoveRow?: (node: RowNode) => void;
  readonly onShowSymbolInfo?: (
    data: INewSymbolData,
    clickType: SpeedOrderClickType
  ) => void;
  readonly onPinRow?: (node: RowNode) => void;
  readonly onUnpinRow?: (node: RowNode) => void;
}
export default class SymbolCell extends React.Component<ISymbolCellProps> {
  constructor(props: ISymbolCellProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div
        className={classNames(styles.SymbolCell, 'ag-cell-wrapper', {
          [styles.SymbolCellWatchlist]: this.props.boardKey === 'WATCHLIST',
        })}
        onClick={
          this.props.boardKey !== 'WATCHLIST'
            ? this.onClickShowSymbolInfo
            : undefined
        }
        onDoubleClick={
          this.props.boardKey !== 'WATCHLIST'
            ? this.onDoubleClickShowSymbolInfo
            : undefined
        }
        onContextMenu={this.onContextMenu}
      >
        <span
          className={`ag-cell-value + ${
            domainConfig[config.domain]?.indexAgCellValue as string
          }`}
          onClick={
            this.props.boardKey !== 'WATCHLIST'
              ? undefined
              : this.onClickShowSymbolInfo
          }
          onDoubleClick={
            this.props.boardKey !== 'WATCHLIST'
              ? undefined
              : this.onDoubleClickShowSymbolInfo
          }
        >
          {this.props.value}
          {this.props.data.ie && <span className={styles.DiviendDate}>*</span>}
        </span>
        {this.props.boardKey === 'WATCHLIST' && (
          <>
            <span className="ag-icon ag-icon-menu" />
            <span
              className="ag-icon ag-icon-cross"
              onClick={this.onRemoveRow}
            />
          </>
        )}
      </div>
    );
  }

  private onRemoveRow = () => {
    if (this.props.boardKey === 'WATCHLIST') {
      this.props.onRemoveRow?.(this.props.node);
    }
  };

  private onContextMenu = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (this.props.boardKey !== 'WATCHLIST') {
      if (this.props.node.rowPinned === 'top') {
        if (this.props.onUnpinRow) {
          this.props.onUnpinRow(this.props.node);
        }
      } else {
        if (this.props.onPinRow) {
          this.props.onPinRow(this.props.node);
        }
      }
    }
  };

  private onClickShowSymbolInfo = () => {
    this.onShowSymbolInfo(SpeedOrderClickType.SINGLE_CLICK);
  };

  private onDoubleClickShowSymbolInfo = () => {
    this.onShowSymbolInfo(SpeedOrderClickType.DOUBLE_CLICK);
  };

  private onShowSymbolInfo = (clickType: SpeedOrderClickType) => {
    if (this.props.node?.data) {
      this.props.onShowSymbolInfo?.(
        this.props.node.data as INewSymbolData,
        clickType
      );
    }
  };
}
