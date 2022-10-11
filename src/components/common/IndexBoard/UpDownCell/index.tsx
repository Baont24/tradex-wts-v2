import * as React from 'react';
import * as styles from './styles.scss';
import { FaArrowDown, FaArrowUp, FaStop } from 'react-icons/fa';
import { Fallback } from 'components/common';
import { ICellRendererParams } from 'ag-grid-community';
import { IIndexChange } from 'interfaces/market';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IUpDownCellProps extends ICellRendererParams {
  readonly value: IIndexChange;
}

class UpDownCell extends React.Component<IUpDownCellProps> {
  constructor(props: IUpDownCellProps) {
    super(props);
  }

  render() {
    return (
      <div className={`${styles.StockChange} d-flex justify-content-center`}>
        <div className={`d-flex`}>
          <p className={styles.Up}>
            <span className={`${styles.IconCenter}  ${styles.StockChangeIcon}`}>
              <FaArrowUp />
            </span>
            <span className={styles.TotalStocks}>
              {this.props.value?.up || 0}
            </span>
          </p>
          <p className={styles.Ref}>
            <span className={`${styles.IconCenter}  ${styles.StockChangeIcon}`}>
              <FaStop />
            </span>
            <span>{this.props.value?.uc || 0}</span>
          </p>
          <p className={styles.Down}>
            <span className={`${styles.IconCenter}  ${styles.StockChangeIcon}`}>
              <FaArrowDown />
            </span>
            <span className={styles.TotalStocks}>
              {this.props.value?.dw || 0}
            </span>
          </p>
        </div>
      </div>
    );
  }
}

export default withErrorBoundary(UpDownCell, Fallback, handleError);
