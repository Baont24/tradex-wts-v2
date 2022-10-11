import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from '../styles.scss';
import { Big } from 'big.js';
import { DropItem, DropItemStop } from './DropCell';
import { IDroppableProps, ISpeedOrderRowData } from '../utils';
import { IState } from 'redux/global-reducers';
import { OrderKind, SellBuyType } from 'constants/enum';
import { connect } from 'react-redux';
import { formatNumber } from 'utils/common';

interface IDataRow extends React.ClassAttributes<DataRowComponent> {
  readonly currentSymbol: IState['currentSymbol'];
  readonly speedOrder: IState['speedOrder'];
  readonly rowData?: ISpeedOrderRowData;
  readonly data?: IDroppableProps['data'];
  readonly speedOrderContainer?: IDroppableProps['speedOrderContainer'];
  readonly currentRowData?: IDroppableProps['currentRowData'];
  readonly className?: string;

  readonly placeOrder: IDroppableProps['placeOrder'];
  readonly moveOrder: IDroppableProps['moveOrder'];
  readonly cancelOrder: IDroppableProps['cancelOrder'];
}

class DataRowComponent extends React.Component<IDataRow> {
  render() {
    const { rowData, speedOrder, data } = this.props;
    const symbolData = speedOrder.data.symbolData;
    const referencePrice =
      symbolData?.re != null && rowData?.price != null
        ? Big(rowData.price).cmp(Big(symbolData.re))
        : 0;
    const isCurrentPrice =
      symbolData?.c != null &&
      rowData?.price != null &&
      Big(rowData.price).eq(Big(symbolData.c));
    const lastPrice = data?.c || data?.re;
    const disabled = (sellBuyType: SellBuyType) =>
      lastPrice != null &&
      rowData?.price != null &&
      ((Big(rowData.price).gte(Big(lastPrice)) &&
        sellBuyType === SellBuyType.SELL) ||
        (Big(rowData.price).lte(Big(lastPrice)) &&
          sellBuyType === SellBuyType.BUY));
    const currentPrice = rowData?.price ?? 0;

    return (
      rowData != null && (
        <div className={this.props.className || styles.Row}>
          <DropItemStop
            orderKind={OrderKind.STOP_LIMIT_ORDER}
            rowData={rowData}
            sellBuyType={SellBuyType.BUY}
            placeOrder={this.props.placeOrder}
            moveOrder={this.props.moveOrder}
            cancelOrder={this.props.cancelOrder}
            data={data}
            currentRowData={this.props.currentRowData}
            speedOrderContainer={this.props.speedOrderContainer}
            disabled={disabled(SellBuyType.BUY)}
          />

          <DropItem
            orderKind={OrderKind.NORMAL_ORDER}
            rowData={rowData}
            sellBuyType={SellBuyType.BUY}
            placeOrder={this.props.placeOrder}
            moveOrder={this.props.moveOrder}
            cancelOrder={this.props.cancelOrder}
            data={data}
            currentRowData={this.props.currentRowData}
            speedOrderContainer={this.props.speedOrderContainer}
          />

          <div className={styles.BidQty}>
            {rowData.bidVolume != null
              ? formatNumber(Number(rowData.bidVolume))
              : null}
          </div>

          <div className={styles.Price}>
            <div
              className={classNames({
                [styles.LastPrice]: isCurrentPrice,
                [globalStyles.Ref]: referencePrice === 0,
                [globalStyles.Up]: referencePrice > 0,
                [globalStyles.Down]: referencePrice < 0,
                [globalStyles.Ceil]: currentPrice === symbolData?.ce,
                [globalStyles.Floor]: currentPrice === symbolData?.fl,
              })}
            >
              {formatNumber(rowData.price, 2)}
            </div>
          </div>

          <div className={styles.AskQty}>
            {rowData.offerVolume != null
              ? formatNumber(Number(rowData.offerVolume))
              : null}
          </div>

          <DropItem
            orderKind={OrderKind.NORMAL_ORDER}
            rowData={rowData}
            sellBuyType={SellBuyType.SELL}
            placeOrder={this.props.placeOrder}
            moveOrder={this.props.moveOrder}
            cancelOrder={this.props.cancelOrder}
            data={data}
            currentRowData={this.props.currentRowData}
            speedOrderContainer={this.props.speedOrderContainer}
          />

          <DropItemStop
            orderKind={OrderKind.STOP_LIMIT_ORDER}
            rowData={rowData}
            sellBuyType={SellBuyType.SELL}
            placeOrder={this.props.placeOrder}
            moveOrder={this.props.moveOrder}
            cancelOrder={this.props.cancelOrder}
            data={data}
            currentRowData={this.props.currentRowData}
            speedOrderContainer={this.props.speedOrderContainer}
            disabled={disabled(SellBuyType.SELL)}
          />
        </div>
      )
    );
  }
}

const mapStateToProps = (state: IState) => ({
  currentSymbol: state.currentSymbol,
  speedOrder: state.speedOrder,
});

const DataRow = connect(mapStateToProps, {})(DataRowComponent);

export default DataRow;
