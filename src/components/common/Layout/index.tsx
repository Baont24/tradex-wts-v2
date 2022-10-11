import * as React from 'react';
import * as styles from './styles.scss';
import { BoardRoutes, Routes } from 'constants/routes';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeRoute } from './actions';
import {
  closeOtpModal,
  setCurrentSymbol,
  toggleSymbolInfoModal,
} from 'redux/global-actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';
import FooterSection from '../FooterSection';
import Modal from '../Modal';
import NavBar from '../NavBar';
import OtpModal from '../OtpModal';
import SideBarFunction from '../SideBarFunction';
import SymbolInfo from '../SymbolInfo';

export interface ILayoutProps
  extends React.ClassAttributes<LayoutComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly route: Routes;
  readonly symbolInfoModal: IState['symbolInfoModal'];
  readonly otp: IState['otp'];
  readonly otpToken: IState['otpToken'];
  readonly isAuthenticated: IState['isAuthenticated'];
  readonly config: IState['config'];

  readonly setCurrentSymbol: typeof setCurrentSymbol;
  readonly changeRoute: typeof changeRoute;
  readonly toggleSymbolInfoModal: typeof toggleSymbolInfoModal;
  readonly closeOtpModal: typeof closeOtpModal;
}

class LayoutComponent extends React.Component<ILayoutProps> {
  constructor(props: ILayoutProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.props.changeRoute(this.props.location.pathname);
  }

  componentDidUpdate(prevProps: ILayoutProps) {
    if (this.props.location !== prevProps.location) {
      this.props.changeRoute(this.props.location.pathname);
    }
  }

  render() {
    return (
      <main className={this.props.config.domain}>
        {this.props.route !== Routes.LOGIN && (
          <NavBar route={this.props.route} />
        )}
        <div className={styles.Container}>
          <div className={styles.Children}>{this.props.children}</div>
          {this.props.route !== Routes.LOGIN && this.props.isAuthenticated && (
            <SideBarFunction />
          )}
        </div>
        {this.props.route !== Routes.LOGIN && <FooterSection />}
        <Modal
          dialogClassName={styles.SymbolInfoModal}
          show={
            this.props.symbolInfoModal.show &&
            !this.props.location.pathname.includes(BoardRoutes.TRADING_TEMPLATE)
          }
          onHide={this.onCloseSymbolInfo}
          size="xl"
        >
          <SymbolInfo />
        </Modal>
        {this.props.otpToken == null && (
          <OtpModal
            size="sm"
            show={this.props.otp.showOtpForm}
            onHide={this.props.closeOtpModal}
            isAfterLoginOtp={true}
          />
        )}
      </main>
    );
  }

  private onCloseSymbolInfo = () => {
    this.props.toggleSymbolInfoModal({ show: false });
  };
}

const mapStateToProps = (state: IState) => ({
  otp: state.otp,
  otpToken: state.otpToken,
  symbolInfoModal: state.symbolInfoModal,
  isAuthenticated: state.isAuthenticated,
  config: state.config,
});

const mapDispatchToProps = {
  setCurrentSymbol,
  changeRoute,
  toggleSymbolInfoModal,
  closeOtpModal,
};

const Layout = withRouter(
  withErrorBoundary(
    withNamespaces(['common'], { wait: true })(
      connect(mapStateToProps, mapDispatchToProps)(LayoutComponent)
    ),
    Fallback,
    handleError
  )
);

export default Layout;
