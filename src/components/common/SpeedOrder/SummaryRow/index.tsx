import * as React from 'react';
import * as styles from './styles.scss';
import { IDraggableProps, ISummaryRowData } from '../utils';
import { IState } from 'redux/global-reducers';
import { LocationBisAskUI, OrderKind, SellBuyType } from 'constants/enum';
import { SummaryItem, SummaryItemStop } from './DraggableSummaryItem';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';

interface ISummaryRowProps
  extends React.ClassAttributes<ISummaryRowProps>,
    WithNamespaces {
  readonly settingsNav: IState['settingsNav'];
  readonly summaryData: ISummaryRowData;
  readonly speedOrderContainer?: IDraggableProps['speedOrderContainer'];

  readonly cancelAllOrders?: IDraggableProps['cancelAllOrders'];
}

const SummaryRow: React.FC<ISummaryRowProps> = ({
  summaryData,
  speedOrderContainer,
  cancelAllOrders,
  settingsNav,
  t,
}) => {
  return (
    <div
      className={classNames(styles.SummaryRow, {
        [styles.RowReverse]: settingsNav === LocationBisAskUI.ASK_BID,
      })}
    >
      <SummaryItemStop
        total={Number(summaryData.totalStopBid)}
        sellBuyType={SellBuyType.BUY}
        cancelAllOrders={cancelAllOrders}
        isTotalRow={true}
        speedOrderContainer={speedOrderContainer}
        orderKind={OrderKind.STOP_LIMIT_ORDER}
      />

      <SummaryItem
        total={Number(summaryData.totalBid)}
        sellBuyType={SellBuyType.BUY}
        cancelAllOrders={cancelAllOrders}
        isTotalRow={true}
        speedOrderContainer={speedOrderContainer}
        orderKind={OrderKind.NORMAL_ORDER}
      />

      <div className={styles.SummaryLabel}>{t('Summary')}</div>

      <SummaryItem
        total={Number(summaryData.totalOffer)}
        sellBuyType={SellBuyType.SELL}
        cancelAllOrders={cancelAllOrders}
        isTotalRow={true}
        speedOrderContainer={speedOrderContainer}
        orderKind={OrderKind.NORMAL_ORDER}
      />

      <SummaryItemStop
        total={Number(summaryData.totalStopOffer)}
        sellBuyType={SellBuyType.SELL}
        cancelAllOrders={cancelAllOrders}
        isTotalRow={true}
        speedOrderContainer={speedOrderContainer}
        orderKind={OrderKind.STOP_LIMIT_ORDER}
      />
    </div>
  );
};

const mapStateToProps = (state: IState) => ({
  settingsNav: state.settingsNav,
});

export default withNamespaces('common')(
  connect(mapStateToProps, {})(SummaryRow)
);
