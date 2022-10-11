import * as Loadable from 'react-loadable';
import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import {
  AlarmSVG,
  BoardSVG,
  InfoSVG,
  NotificationSVG,
  OrderSVG,
  QuickOrderSVG,
} from 'assets/svg';
import { Fallback } from 'components/common';
import { FunctionKey } from 'constants/enum';
import { IState } from 'redux/global-reducers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeSidebarFunction } from './actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import CashBarSectionMini from 'components/areas/Account/AssetInformation/CashBarSection';
import OrderBookMini from 'components/areas/Account/OrderBook/OderBookMini';
import PortfolioMini from 'components/areas/Account/Portfolio/PortfolioMini';

const DashboardFunction = Loadable({
  loader: () => import('./DashboardFunction'),
  loading(props) {
    return props.pastDelay ? <Fallback /> : null;
  },
});

const AlarmFunction = Loadable({
  loader: () => import('./AlarmFunction'),
  loading(props) {
    return props.pastDelay ? <Fallback /> : null;
  },
});

const InfoFunction = Loadable({
  loader: () => import('./InfoFunction'),
  loading(props) {
    return props.pastDelay ? <Fallback /> : null;
  },
});

const SpeedOrderFunction = Loadable({
  loader: () => import('./SpeedOrderFunction'),
  loading(props) {
    return props.pastDelay ? <Fallback /> : null;
  },
});

const NotificationFunction = Loadable({
  loader: () => import('./NotificationFunction'),
  loading(props) {
    return props.pastDelay ? <Fallback /> : null;
  },
});

const OrderFunction = Loadable({
  loader: () => import('./OrderFunction'),
  loading(props) {
    return props.pastDelay ? <Fallback /> : null;
  },
});

export interface IBoardFuntion {
  readonly [s: string]: {
    readonly icon?: React.ReactNode;
    readonly component?: React.ReactNode;
    readonly position?: 'SIDEBAR' | 'FOOTER';
    readonly tooltip: string;
    readonly hide?: boolean;
  };
}

const Functions: IBoardFuntion = {
  [FunctionKey.DASHBOARD]: {
    icon: <BoardSVG />,
    component: <DashboardFunction />,
    position: 'SIDEBAR',
    tooltip: 'Dashboard',
  },
  [FunctionKey.INFO]: {
    icon: <InfoSVG />,
    component: <InfoFunction />,
    position: 'SIDEBAR',
    tooltip: 'Detail 2',
  },
  [FunctionKey.ALARM]: {
    icon: <AlarmSVG />,
    component: <AlarmFunction />,
    position: 'SIDEBAR',
    tooltip: 'Alert',
    hide: true,
  },
  // [FunctionKey.CALENDAR]: {
  //   icon: <CalendarSVG />,
  //   position: 'SIDEBAR',
  //   tooltip: 'Calendar',
  // },
  [FunctionKey.QUICK_ORDER]: {
    icon: <QuickOrderSVG />,
    position: 'SIDEBAR',
    component: <SpeedOrderFunction />,
    tooltip: 'Speed Order',
  },
  [FunctionKey.ORDER]: {
    icon: <OrderSVG />,
    position: 'SIDEBAR',
    component: <OrderFunction />,
    tooltip: 'Place Order',
  },
  // [FunctionKey.CHART]: {
  //   icon: <ChartSVG />,
  //   position: 'SIDEBAR',
  //   tooltip: 'VN30 Estimation',
  // },
  [FunctionKey.NOTIFICATION]: {
    icon: <NotificationSVG />,
    position: 'SIDEBAR',
    component: <NotificationFunction />,
    tooltip: 'Notification',
    hide: true,
  },
  // [FunctionKey.HELP]: {
  //   icon: <HelpSVG />,
  //   position: 'SIDEBAR',
  //   tooltip: 'Help',
  // },
  // [FunctionKey.SETTING]: {
  //   icon: <SettingSVG />,
  //   position: 'SIDEBAR',
  //   tooltip: 'Setting',
  // },
  // [FunctionKey.FEEDBACK]: {
  //   icon: <FeedbackSVG />,
  //   position: 'SIDEBAR',
  //   tooltip: 'Feedback',
  // },
  [FunctionKey.ORDER_BOOK]: {
    position: 'FOOTER',
    tooltip: 'Order Book',
    component: <OrderBookMini />,
  },
  [FunctionKey.CASH]: {
    position: 'FOOTER',
    tooltip: 'Cash',
    component: <CashBarSectionMini />,
  },
  [FunctionKey.PORTFOLIO]: {
    position: 'FOOTER',
    tooltip: 'Portfolio',
    component: <PortfolioMini />,
  },
};

export interface ISideBarFunctionProps
  extends React.ClassAttributes<SideBarFunctionComponent>,
    WithNamespaces {
  readonly sideBarFunction: IState['sideBarFunction'];

  readonly changeSidebarFunction: typeof changeSidebarFunction;
}

class SideBarFunctionComponent extends React.Component<ISideBarFunctionProps> {
  constructor(props: ISideBarFunctionProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t } = this.props;
    return (
      <div className={styles.SideBarFunction}>
        {this.props.sideBarFunction.key != null && (
          <div
            className={classNames(styles.FunctionPanel, {
              [styles.FunctionPanelFooter]:
                this.props.sideBarFunction.key === FunctionKey.ORDER_BOOK ||
                this.props.sideBarFunction.key === FunctionKey.CASH ||
                this.props.sideBarFunction.key === FunctionKey.PORTFOLIO,
            })}
          >
            {Functions[this.props.sideBarFunction.key].component}
          </div>
        )}
        <div className={styles.FunctionMenu}>
          {Object.keys(Functions)
            .filter(
              (val) =>
                !Functions[val].hide && Functions[val].position === 'SIDEBAR'
            )
            .map((val, i) => {
              const onSelectItem = () => this.onShowPanel(val as FunctionKey);
              return (
                <OverlayTrigger
                  key={i}
                  placement="left"
                  overlay={
                    <Tooltip className={styles.BoardTooltip} id={`'${i}'`}>
                      {t(Functions[val].tooltip)}
                    </Tooltip>
                  }
                >
                  <div
                    key={i}
                    className={classNames(styles.FunctionItem, {
                      [styles.Active]: this.props.sideBarFunction.key === val,
                    })}
                    onClick={onSelectItem}
                  >
                    <div className={styles.Logo}>{Functions[val].icon}</div>
                  </div>
                </OverlayTrigger>
              );
            })}
        </div>
      </div>
    );
  }

  private onShowPanel = (key: FunctionKey) => {
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

const SideBarFunction = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(SideBarFunctionComponent)
  ),
  Fallback,
  handleError
);

export default SideBarFunction;
