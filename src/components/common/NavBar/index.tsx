import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { AccountDropdown, Modal } from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { AccountType, FunctionKey } from 'constants/enum';
import { CategoriesSVG, UtilitySVG } from 'assets/svg';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { INavbarTitle, INavbarTitleVietNamese } from 'interfaces/config';
import { IState } from 'redux/global-reducers';
import { Link, NavLink, match } from 'react-router-dom';
import { Location } from 'history';
import { Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router';
import { STORED_SELECTED_ACCOUNT } from 'constants/main';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  changeAccount,
  logout,
  toggleSymbolInfoModal,
} from 'redux/global-actions';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { getKey, removeKey, setKey } from 'utils/localStorage';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';
import LanguageSwitcher from '../LanguageSwitcher';
import SettingsNav from '../SettingsNav';
import SymbolSearch from '../SymbolSearch';

export interface INavBarProps
  extends React.ClassAttributes<NavBar>,
    WithNamespaces,
    RouteComponentProps {
  readonly route: Routes;
  readonly isAuthenticated: IState['isAuthenticated'];
  readonly symbolList: IState['symbolList'];
  readonly wtsSocket: IState['wtsSocket'];
  readonly selectedAccount: IState['selectedAccount'];
  readonly sideBarFunction: IState['sideBarFunction'];
  readonly config: IState['config'];
  readonly logoutDomainInfo: IState['logoutDomainInfo'];
  readonly accountList: IState['accountList'];

  readonly logout: typeof logout;
  readonly toggleSymbolInfoModal: typeof toggleSymbolInfoModal;
  readonly changeAccount: typeof changeAccount;
}

export interface INavBarState {
  readonly isLogoutModalOpened?: boolean;
  readonly location?: Location;
  readonly isClicked?: string;
  readonly isDerivativeAccountSelected?: boolean;
  readonly hasDerivativeAccountType?: boolean;
}

interface StorageAccountSelected {
  readonly isDerivativeAccountSelected: boolean;
}

class NavBar extends React.Component<INavBarProps, INavBarState> {
  private mainRefAccount: React.RefObject<HTMLLabelElement>;
  private mainRefBoard: React.RefObject<HTMLLabelElement>;
  private mainRefInformation: React.RefObject<HTMLLabelElement>;

  constructor(props: INavBarProps) {
    super(props);

    const indexSliderState = getKey<StorageAccountSelected>(
      STORED_SELECTED_ACCOUNT
    );

    this.state = {
      isDerivativeAccountSelected:
        indexSliderState != null
          ? indexSliderState.isDerivativeAccountSelected
          : false,
      hasDerivativeAccountType: this.props.accountList.some(
        (account) => account.isDerivatives
      ),
    };

    this.mainRefAccount = React.createRef();
    this.mainRefBoard = React.createRef();
    this.mainRefInformation = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick);
  }

  componentDidUpdate(prevProps: INavBarProps) {
    if (prevProps.selectedAccount !== this.props.selectedAccount) {
      const { selectedAccount } = this.props;
      if (selectedAccount?.isDerivatives) {
        setKey(STORED_SELECTED_ACCOUNT, { isDerivativeAccountSelected: true });
        this.setState({ isDerivativeAccountSelected: true });
      } else {
        setKey(STORED_SELECTED_ACCOUNT, { isDerivativeAccountSelected: false });
        this.setState({ isDerivativeAccountSelected: false });
      }
    }

    if (prevProps.accountList !== this.props.accountList) {
      this.setState({
        hasDerivativeAccountType: this.props.accountList.some(
          (account) => account.isDerivatives
        ),
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }

  render() {
    const { t, route, isAuthenticated, selectedAccount, config } = this.props;
    const Logo = './injectable/logo.svg';
    const isHideWhenXisIICA =
      selectedAccount?.isIICA &&
      selectedAccount?.accountType === AccountType.EQUITY;

    return (
      <Navbar
        className={classNames(
          styles.NavBar,
          { [styles.SideBarActive]: this.props.sideBarFunction.key != null },
          {
            [styles.SideBarActiveFooter]:
              this.props.sideBarFunction.key === FunctionKey.ORDER_BOOK ||
              this.props.sideBarFunction.key === FunctionKey.CASH ||
              this.props.sideBarFunction.key === FunctionKey.PORTFOLIO,
          }
        )}
      >
        <Link
          className={classNames(
            styles.Logo,
            { [styles.LogoForKis]: domainConfig[config.domain]?.logoForKis },
            { [styles.LogoForVcsc]: domainConfig[config.domain]?.logoForVcsc }
          )}
          to={`/${Routes.BOARD}`}
        >
          <img src={Logo} />
        </Link>
        <Nav className={styles.Left}>
          {config.nav.map(
            (nav) =>
              !nav.hide &&
              nav.isAuthenticated === isAuthenticated &&
              (nav.systemType == null ||
                nav.systemType === selectedAccount?.type) &&
              (nav.tab.length > 0 ? (
                <NavDropdown
                  title={
                    <label
                      className={styles.MainLink}
                      ref={
                        nav.title === INavbarTitle.Account
                          ? this.mainRefAccount
                          : nav.title === INavbarTitle.Board
                          ? this.mainRefBoard
                          : this.mainRefInformation
                      }
                      onClick={this.handleClickLabel}
                      onDoubleClick={this.handleDoubleClickLabel}
                    >
                      {t(nav.title)}
                    </label>
                  }
                  id={`collasible-nav-dropdown-${nav.key}`}
                  className={classNames(styles.NavLink, {
                    [styles.HideSubTab]: nav.pinned && route === nav.route,
                    [styles.ClickMenu]: nav.title === this.state.isClicked,
                  })}
                  show={true}
                  key={nav.key}
                  active={route === nav.route}
                >
                  <div className={styles.DropdownTab}>
                    <NavDropdown.Item className={styles.DropdownTabHeader} />
                  </div>
                  {nav.tab.map(
                    (tab, i) =>
                      !tab.hide && (
                        <div
                          key={i}
                          className={classNames(styles.DropdownTab, {
                            [styles.HideWhenXisIICA]:
                              isHideWhenXisIICA &&
                              AccountRoutes.CASH_TRANSFER_REQUEST === tab.route,
                            [styles.NoBorderBottom]: nav.route === Routes.BOARD,
                          })}
                        >
                          <Link
                            to={`/${nav.route}/${tab.route}`}
                            className={classNames(
                              styles.DropdownTabHeader,
                              {
                                [styles.Active]:
                                  tab.subTab?.some(
                                    (ele) =>
                                      location.pathname.slice(
                                        nav.route.length + 2
                                      ) === ele.route
                                  ) ||
                                  location.pathname.slice(
                                    nav.route.length + 2
                                  ) === tab.route,
                              },
                              'dropdown-item'
                            )}
                            onClick={this.onClickLink}
                          >
                            {t(tab.title)}
                          </Link>
                          {tab.subTab &&
                            tab.subTab.map((subTab, j) => (
                              <Link
                                key={j}
                                to={`/${nav.route}/${subTab.route}`}
                                className={classNames(
                                  styles.DropdownSubTab,
                                  {
                                    [styles.Active]:
                                      location.pathname.slice(
                                        nav.route.length + 2
                                      ) === subTab.route,
                                  },
                                  'dropdown-item'
                                )}
                                onClick={this.onClickLink}
                              >
                                {t(subTab.title)}
                              </Link>
                            ))}
                        </div>
                      )
                  )}
                  <div className={styles.DropdownTab}>
                    <NavDropdown.Item className={styles.DropdownTabHeader} />
                  </div>
                </NavDropdown>
              ) : config.isHideTopMenu && isAuthenticated === false ? null : (
                <NavLink
                  className={classNames(styles.NavLink, styles.NavLinkButton)}
                  activeClassName={'active'}
                  to={`/${nav.route}`}
                  isActive={this.isRootActive}
                  key={nav.key}
                >
                  {t(nav.title)}
                </NavLink>
              ))
          )}
        </Nav>
        <Nav className={styles.Right}>
          <div className={styles.RightItem}>
            <div className={styles.SymbolPickerSection}>
              <SymbolSearch
                placeholder={t('Search Stock')}
                onSymbolSearch={this.onSymbolSearch}
              />
            </div>
          </div>
          {isAuthenticated && (
            <div className={styles.SwitchButton}>
              <button
                className={classNames({
                  [styles.Active]: this.state.isDerivativeAccountSelected,
                })}
                onClick={this.onSelectDer}
                disabled={!this.state.hasDerivativeAccountType}
              >
                {t('Derivatives')}
              </button>
              <button
                className={classNames({
                  [styles.Active]: !this.state.isDerivativeAccountSelected,
                })}
                onClick={this.onSelectEquity}
              >
                {t('Equity 1')}
              </button>
            </div>
          )}
          {isAuthenticated && (
            <div className={styles.RightItem}>
              <AccountDropdown />
            </div>
          )}
          {false && (
            <>
              <div className={styles.RightItem}>
                <UtilitySVG />
              </div>
              <div className={styles.RightItem}>
                <CategoriesSVG />
              </div>
            </>
          )}
          <div className={styles.RightItem}>
            <LanguageSwitcher />
          </div>
          {isAuthenticated && (
            <div className={styles.RightItem}>
              <SettingsNav />
            </div>
          )}
          <div className={styles.RightItem}>
            {isAuthenticated ? (
              <div
                className={styles.LogoutButton}
                onClick={this.onOpenLogoutModal}
              >
                <FaSignOutAlt className={styles.LogoutLogo} />
                <span>{t('Logout')}</span>
              </div>
            ) : (
              (!this.props.config.disableLogin || config.loginUrl != null) &&
              (config.loginUrl ? (
                <a
                  className={styles.LoginButton}
                  href={config.loginUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <>
                    <FaSignInAlt className={styles.LoginLogo} />
                    <span>{t('Login')}</span>
                  </>
                </a>
              ) : (
                <Link className={styles.LoginButton} to={`/${Routes.LOGIN}`}>
                  <>
                    <FaSignInAlt className={styles.LoginLogo} />
                    <span>{t('Login')}</span>
                  </>
                </Link>
              ))
            )}
          </div>
        </Nav>

        {isAuthenticated && (
          <Modal
            show={this.state.isLogoutModalOpened}
            onHide={this.onHideLogoutModal}
            size="sm"
            isBackgroundBlur={true}
          >
            <div className={styles.LogoutModal}>
              <div className={styles.Title}>
                {t('Are you sure you want to logout?')}
              </div>
              <div className={styles.ButtonSection}>
                <button
                  className={styles.ConfirmButton}
                  onClick={this.onLogout}
                >
                  {t('Confirm')}
                </button>
                <button
                  className={styles.CancelButton}
                  onClick={this.onHideLogoutModal}
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
          </Modal>
        )}

        <Modal
          show={this.props.logoutDomainInfo.isSessionTimeout}
          onHide={this.onLogout}
          size="sm"
          isBackgroundBlur={true}
        >
          <div className={styles.LogoutModalTimeout}>
            <div className={styles.Title}>{t('Session Timeout 2')}</div>
            <div className={styles.Title}>
              {t(
                'The login session has expired or the account is logged into onther device. Please log in again.'
              )}
            </div>
          </div>
        </Modal>
      </Navbar>
    );
  }

  private onSelectDer = () => {
    const selectedAccount = this.props.accountList.find(
      (val) => val.isDerivatives === true
    );
    if (selectedAccount) {
      this.props.changeAccount(selectedAccount);
    }
    this.setState({ isDerivativeAccountSelected: true });
    setKey(STORED_SELECTED_ACCOUNT, { isDerivativeAccountSelected: true });
  };
  private onSelectEquity = () => {
    const selectedAccount = this.props.accountList.filter(
      (val) => val.isEquity === true
    );
    if (selectedAccount.length > 0) {
      this.props.changeAccount(selectedAccount[0]);
    }
    this.setState({ isDerivativeAccountSelected: false });
    setKey(STORED_SELECTED_ACCOUNT, { isDerivativeAccountSelected: false });
  };

  private isRootActive = (m: match, location: Location) => {
    return (
      location.pathname.substring(1) === Routes.ROOT ||
      location.pathname.includes(Routes.BOARD)
    );
  };

  private onOpenLogoutModal = () => {
    this.setState({ isLogoutModalOpened: true });
  };

  private onHideLogoutModal = () => {
    this.setState({ isLogoutModalOpened: false });
  };

  private onLogout = () => {
    removeKey(STORED_SELECTED_ACCOUNT);
    this.setState({ isLogoutModalOpened: false }, () => {
      this.props.logout({
        force: true,
      });
    });
  };

  private onSymbolSearch = (code: string | null) => {
    if (code) {
      this.props.toggleSymbolInfoModal({
        show: true,
        data: this.props.symbolList.map?.[code],
        symbol: { code, forceUpdate: true },
      });
    }
  };

  private onClickLink = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
    this.setState({ isClicked: '' });
  };
  private handleClickLabel = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    const target =
      (event.target as HTMLElement).innerText ===
        INavbarTitleVietNamese.Board ||
      (event.target as HTMLElement).innerText === INavbarTitle.Board
        ? INavbarTitle.Board
        : (event.target as HTMLElement).innerText ===
            INavbarTitleVietNamese.Account ||
          (event.target as HTMLElement).innerText === INavbarTitle.Account
        ? INavbarTitle.Account
        : INavbarTitle.Information;
    this.setState({
      isClicked: this.state.isClicked === target ? '' : target,
    });
  };
  private handleDoubleClickLabel = (event: any) => {
    if (
      event.target.innerText === INavbarTitle.Board ||
      event.target.innerText === INavbarTitleVietNamese.Board
    ) {
      this.props.history.push(`/${Routes.BOARD}`);
    }
  };
  private handleClick = (event: { target: any }) => {
    const { target } = event;

    if (
      this.mainRefBoard.current &&
      this.mainRefAccount.current &&
      this.mainRefInformation.current
    ) {
      if (
        !this.mainRefBoard.current.contains(target) &&
        !this.mainRefAccount.current.contains(target) &&
        !this.mainRefInformation.current.contains(target)
      ) {
        this.setState({
          isClicked:
            this.state.isClicked === (event.target as HTMLElement).innerText
              ? ''
              : (event.target as HTMLElement).innerText,
        });
      }
    }
  };
}

const mapStateToProps = (state: IState) => ({
  isAuthenticated: state.isAuthenticated,
  symbolList: state.symbolList,
  wtsSocket: state.wtsSocket,
  selectedAccount: state.selectedAccount,
  sideBarFunction: state.sideBarFunction,
  config: state.config,
  logoutDomainInfo: state.logoutDomainInfo,
  accountList: state.accountList,
});

const mapDispatchToProps = {
  logout,
  toggleSymbolInfoModal,
  changeAccount,
};

export default withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(NavBar)
    ),
    Fallback,
    handleError
  )
);
