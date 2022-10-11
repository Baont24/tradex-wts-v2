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
import Portfolio from '..';

export interface IPortfolioMiniProps
  extends React.ClassAttributes<PortfolioMiniComponent>,
    WithNamespaces {
  readonly sideBarFunction: IState['sideBarFunction'];

  readonly changeSidebarFunction: typeof changeSidebarFunction;
}

export interface IPortfolioMiniState {
  readonly refresh: boolean;
}

class PortfolioMiniComponent extends React.Component<
  IPortfolioMiniProps,
  IPortfolioMiniState
> {
  constructor(props: IPortfolioMiniProps) {
    super(props);
    this.state = {
      refresh: false,
    };
  }

  render() {
    const { refresh } = this.state;
    return (
      <div className={style.PortfolioMini}>
        <TabTable
          data={[
            {
              key: 'Portfolio',
              title: 'Portfolio',
              default: true,
              component: (
                <Portfolio isSmallComponent={true} refresh={refresh} />
              ),
            },
          ]}
        />
        <div className={style.PortfolioButton}>
          <div>
            <Link to={`/${Routes.ACCOUNT}/${AccountRoutes.PORTFOLIO}`}>
              <RoundEllipsisSVG />
            </Link>
          </div>
          <div onClick={this.onRefreshClick}>
            <FaRedoAlt size={11} />
          </div>
          <div onClick={this.onPortfolioClick}>
            <FaChevronDown size={14} />
          </div>
        </div>
      </div>
    );
  }

  private onRefreshClick = () => {
    this.setState({ refresh: !this.state.refresh });
  };

  private onPortfolioClick = () => {
    this.onSidebarFunctionChange(FunctionKey.PORTFOLIO);
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

const PortfolioMini = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(PortfolioMiniComponent)
  ),
  Fallback,
  handleError
);

export default PortfolioMini;
