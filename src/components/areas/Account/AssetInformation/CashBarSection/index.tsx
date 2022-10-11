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
import AssetInformation from '..';

interface ICashBarSectionMiniProps
  extends React.ClassAttributes<CashBarSectionMiniComponent>,
    WithNamespaces {
  readonly sideBarFunction: IState['sideBarFunction'];

  readonly changeSidebarFunction: typeof changeSidebarFunction;
}

class CashBarSectionMiniComponent extends React.Component<
  ICashBarSectionMiniProps
> {
  constructor(props: ICashBarSectionMiniProps) {
    super(props);
  }

  render() {
    return (
      <div className={style.CashBarSectionMini}>
        <TabTable
          data={[
            {
              key: 'Cash',
              title: 'Cash',
              default: true,
              component: <AssetInformation isSmallComponent={true} />,
            },
          ]}
        />
        <div className={style.CashBarSectionButton}>
          <div>
            <Link to={`/${Routes.ACCOUNT}/${AccountRoutes.ASSET_MANAGEMENT}`}>
              <RoundEllipsisSVG />
            </Link>
          </div>
          <div>
            <FaRedoAlt size={11} />
          </div>
          <div onClick={this.onCashClick}>
            <FaChevronDown size={14} />
          </div>
        </div>
      </div>
    );
  }

  private onCashClick = () => {
    this.onSidebarFunctionChange(FunctionKey.CASH);
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

const CashBarSectionMini = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(CashBarSectionMiniComponent)
  ),
  Fallback,
  handleError
);

export default CashBarSectionMini;
