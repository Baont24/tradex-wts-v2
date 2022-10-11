import * as React from 'react';
import * as styles from './styles.scss';
import {
  DERIVATIVES_ORDER_TAB,
  DERIVATIVES_ORDER_TAB_TRADING_TEMPLATE,
  EQUITY_ORDER_TAB,
  EQUITY_ORDER_TAB_TRADING_TEMPLATE,
} from './config';
import { Fallback, TabTable } from 'components/common';
import { IState } from 'redux/global-reducers';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface IOrderFunctionProps
  extends React.ClassAttributes<OrderFunctionComponent>,
    WithNamespaces {
  readonly currentSymbol: IState['currentSymbol'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly isTradingTemplate?: boolean;
}

class OrderFunctionComponent extends React.Component<IOrderFunctionProps> {
  constructor(props: IOrderFunctionProps) {
    super(props);

    this.state = {};
  }

  render() {
    const tabTableData = this.props.isTradingTemplate
      ? this.props.selectedAccount?.type === SystemType.DERIVATIVES
        ? DERIVATIVES_ORDER_TAB_TRADING_TEMPLATE
        : EQUITY_ORDER_TAB_TRADING_TEMPLATE
      : this.props.selectedAccount?.type === SystemType.DERIVATIVES
      ? DERIVATIVES_ORDER_TAB
      : EQUITY_ORDER_TAB;

    return (
      <div className={styles.OrderFunction}>
        <TabTable data={tabTableData} />
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  currentSymbol: state.currentSymbol,
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {};

const OrderFunction = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OrderFunctionComponent)
  ),
  Fallback,
  handleError
);

export default OrderFunction;
