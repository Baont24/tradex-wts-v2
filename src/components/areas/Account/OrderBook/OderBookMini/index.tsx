import * as React from 'react';
import * as style from './styles.scss';
import { AccountRoutes, Routes } from 'constants/routes';
import { FaChevronDown, FaRedoAlt } from 'react-icons/fa';
import { Fallback, TabTable } from 'components/common';
import { FunctionKey } from 'constants/enum';
import { IState } from 'redux/global-reducers';
import { Link } from 'react-router-dom';
import { RoundEllipsisSVG } from 'assets/svg';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeSidebarFunction } from 'components/common/SideBarFunction/actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import OrderBook from '..';

export interface IOrderBookMiniProps
  extends React.ClassAttributes<OrderBookMiniComponent>,
    WithNamespaces {
  readonly sideBarFunction: IState['sideBarFunction'];

  readonly changeSidebarFunction: typeof changeSidebarFunction;
}

export interface IOrderBookMiniState {
  readonly refresh: boolean;
}

class OrderBookMiniComponent extends React.Component<
  IOrderBookMiniProps,
  IOrderBookMiniState
> {
  constructor(props: IOrderBookMiniProps) {
    super(props);

    this.state = {
      refresh: false,
    };
  }

  render() {
    const { refresh } = this.state;
    return (
      <div className={style.OrderBookMini}>
        <TabTable
          data={[
            {
              key: 'Order Book',
              title: 'Order Book',
              default: true,
              component: (
                <OrderBook isSmallComponent={true} refresh={refresh} />
              ),
            },
          ]}
        />
        <div className={style.OrderBookButton}>
          <div>
            <Link to={`/${Routes.ACCOUNT}/${AccountRoutes.ORDER_BOOK}`}>
              <RoundEllipsisSVG />
            </Link>
          </div>
          <div onClick={this.onRefreshClick}>
            <FaRedoAlt size={11} />
          </div>
          <div onClick={this.onOrderBookClick}>
            <FaChevronDown size={14} />
          </div>
        </div>
      </div>
    );
  }

  private onRefreshClick = () => {
    this.setState({ refresh: !this.state.refresh });
  };

  private onOrderBookClick = () => {
    this.onSidebarFunctionChange(FunctionKey.ORDER_BOOK);
  };

  private onSidebarFunctionChange = (key: FunctionKey) => {
    if (this.props.sideBarFunction.key !== key) {
      this.props.changeSidebarFunction({ key });
    } else {
      this.props.changeSidebarFunction({});
    }
  };
}

const mapStateToProps = (state: IState) => ({
  sideBarFunction: state.sideBarFunction,
});

const mapDispatchToProps = {
  changeSidebarFunction,
};

const OrderBookMini = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OrderBookMiniComponent)
  ),
  Fallback,
  handleError
);

export default OrderBookMini;
