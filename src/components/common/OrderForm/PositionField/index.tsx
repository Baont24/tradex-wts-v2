import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface IPositionFieldProps
  extends React.ClassAttributes<PositionFieldComponent>,
    WithNamespaces {
  readonly onClickPosition?: (value: number) => void;
}

class PositionFieldComponent extends React.Component<IPositionFieldProps> {
  constructor(props: IPositionFieldProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t } = this.props;

    return (
      <table className={styles.PositionField}>
        <colgroup>
          <col span={1} style={{ width: '20%' }} />
          <col span={1} style={{ width: '15%' }} />
          <col span={1} style={{ width: '15%' }} />
          <col span={1} style={{ width: '20%' }} />
          <col span={1} style={{ width: '15%' }} />
          <col span={1} style={{ width: '15%' }} />
        </colgroup>
        <tbody>
          <tr className={styles.Row}>
            <td
              className={classNames(styles.Cell, styles.CellTitle)}
              rowSpan={2}
            >
              {t('Max Qty')}
            </td>
            <td className={classNames(styles.Cell, styles.CellBuy)}>B</td>
            <td
              className={classNames(styles.Cell, styles.CellBuyValue)}
              title={'0'}
              onClick={this.onCellClick}
            >
              {0}
            </td>
            <td
              className={classNames(styles.Cell, styles.CellTitle)}
              rowSpan={2}
            >
              {t('Work')}
            </td>
            <td className={classNames(styles.Cell, styles.CellBuy)}>B</td>
            <td
              className={classNames(styles.Cell, styles.CellBuyValue)}
              title={'0'}
              onClick={this.onCellClick}
            >
              {0}
            </td>
          </tr>
          <tr className={styles.Row}>
            <td className={classNames(styles.Cell, styles.CellSell)}>S</td>
            <td
              className={classNames(styles.Cell, styles.CellSellValue)}
              title={'0'}
              onClick={this.onCellClick}
            >
              {0}
            </td>
            <td className={classNames(styles.Cell, styles.CellSell)}>S</td>
            <td
              className={classNames(styles.Cell, styles.CellSellValue)}
              title={'0'}
              onClick={this.onCellClick}
            >
              {0}
            </td>
          </tr>
          <tr className={styles.Row}>
            <td className={classNames(styles.Cell, styles.CellTitle)}>
              {t('Position')}
            </td>
            <td className={classNames(styles.Cell, styles.CellBuy)}>B</td>
            <td
              className={classNames(styles.Cell, styles.CellBuyValue)}
              title={'0'}
              onClick={this.onCellClick}
            >
              {0}
            </td>
            <td
              className={classNames(styles.Cell, styles.CellClose)}
              title={'0'}
              onClick={this.onCellClick}
            >{`${t('Close')}: 0`}</td>
            <td
              className={classNames(styles.Cell, styles.CellReverse)}
              colSpan={2}
              title={'0'}
              onClick={this.onCellClick}
            >{`${t('Reverse')}: 0`}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  private onCellClick = (
    event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>
  ) => {
    const value = +(event.target as HTMLTableDataCellElement).title;
    if (value != null) {
      this.props.onClickPosition?.(value);
    }
  };
}

const mapStateToProps = (state: IState) => ({});

const mapDispatchToProps = {};

const PositionField = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(PositionFieldComponent)
  ),
  Fallback,
  handleError
);

export default PositionField;
