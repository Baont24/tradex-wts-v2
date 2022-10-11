import * as React from 'react';
import * as styles from './styles.scss';
import { BoardRoutes } from 'constants/routes';
import { Fallback } from 'components/common';
import {
  FunctionKey,
  OrderType,
  SellBuyType,
  SystemType,
} from 'constants/enum';
import { ICellRendererParams } from 'ag-grid-community';
import {
  IDrAccountOpenPositionItem,
  IEquityEnquiryPortfolioBeanItemResponse,
} from 'interfaces/api';
import {
  ISideBarFunctionAction,
  changeFooterFunction,
  changeSidebarFunction,
} from 'components/common/SideBarFunction/actions';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { roundLot } from 'utils/market';
import { setCurrentSymbol } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IAccountPortfolioProps
  extends React.ClassAttributes<PortfolioBtnCellComponent>,
    WithNamespaces,
    ICellRendererParams {
  readonly selectedAccount: IState['selectedAccount'];
  readonly symbolList: IState['symbolList'];
  readonly sideBarFunction?: IState['sideBarFunction'];
  readonly data:
    | IDrAccountOpenPositionItem
    | IEquityEnquiryPortfolioBeanItemResponse
    | undefined;
  readonly router: IState['router'];

  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly changeFooterFunction: typeof changeFooterFunction;
  readonly changeSidebarFunction: typeof changeSidebarFunction;
}

class PortfolioBtnCellComponent extends React.Component<
  IAccountPortfolioProps
> {
  constructor(props: IAccountPortfolioProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { t } = this.props;
    return (
      <div className={styles.PortfolioBtnCell}>
        <button onClick={this.onClick}>
          {t(
            this.props.selectedAccount?.type === SystemType.DERIVATIVES
              ? 'Close'
              : 'Sell'
          )}
        </button>
      </div>
    );
  }

  private onClick = () => {
    const { selectedAccount, data, sideBarFunction } = this.props;
    if (selectedAccount != null && data != null) {
      const isDerivatives = selectedAccount.type === SystemType.DERIVATIVES;
      const stockCode = isDerivatives
        ? (data as IDrAccountOpenPositionItem).seriesID
        : (data as IEquityEnquiryPortfolioBeanItemResponse).symbol;
      const symbol = this.props.symbolList.map?.[stockCode];
      const sellBuyType = isDerivatives
        ? (data as IDrAccountOpenPositionItem).long >
          (data as IDrAccountOpenPositionItem).short
          ? SellBuyType.SELL
          : SellBuyType.BUY
        : SellBuyType.SELL;
      const orderQuantity = isDerivatives
        ? sellBuyType === SellBuyType.SELL
          ? (data as IDrAccountOpenPositionItem).long
          : (data as IDrAccountOpenPositionItem).short
        : roundLot(
            (data as IEquityEnquiryPortfolioBeanItemResponse).sellable,
            symbol?.m,
            symbol?.t,
            undefined,
            true,
            undefined,
            undefined,
            sellBuyType
          );
      const functionKey =
        sideBarFunction?.key === FunctionKey.QUICK_ORDER
          ? FunctionKey.QUICK_ORDER
          : FunctionKey.ORDER;
      const params = {
        key: this.props.router.includes(BoardRoutes.TRADING_TEMPLATE)
          ? undefined
          : functionKey,
        orderForm: {
          accountNumber: selectedAccount.accountNumber,
          orderQuantityType: 'share',
          orderType: OrderType.LO,
          orderQuantity,
          sellBuyType,
          stockCode,
        },
      } as ISideBarFunctionAction;
      if (
        sideBarFunction?.key &&
        sideBarFunction?.key === FunctionKey.QUICK_ORDER
      ) {
        this.props.changeSidebarFunction(params);
      } else {
        if (sideBarFunction?.key) {
          this.props.changeSidebarFunction(params);
        } else {
          this.props.changeFooterFunction(params);
        }
      }
    }
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  symbolList: state.symbolList,
  router: state.router,
  sideBarFunction: state.sideBarFunction,
});

const mapDispatchToProps = {
  changeFooterFunction,
  changeSidebarFunction,
  setCurrentSymbol,
};

const PortfolioBtnCell = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(PortfolioBtnCellComponent)
  ),
  Fallback,
  handleError
);

export default PortfolioBtnCell;
