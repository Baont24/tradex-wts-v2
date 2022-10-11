import * as React from 'react';
import * as styles from './styles.scss';
import { AccountDropdown, Fallback, TabTable } from 'components/common';
import { AccountRoutes, Routes } from 'constants/routes';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { SystemType } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { assetManagementTab } from '../config';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import AssetInforDerivatives from './AssetInforDerivatives';
import AssetInforEquity from './AssetInforEquity';

interface IAssetInformationProps
  extends React.ClassAttributes<AssetInformationComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly isSmallComponent?: boolean;
  readonly selectedAccount: IState['selectedAccount'];
}

class AssetInformationComponent extends React.Component<
  IAssetInformationProps
> {
  constructor(props: IAssetInformationProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, isSmallComponent } = this.props;

    const RenderItem = (
      <div className={styles.TabBoard}>
        {!isSmallComponent && (
          <div className={styles.TabAccount}>
            <p>{t('Account No')}</p>
            <div>
              <AccountDropdown isForm={true} />
            </div>
          </div>
        )}
        {this.props.selectedAccount?.type === SystemType.DERIVATIVES ? (
          <AssetInforDerivatives isSmallComponent={isSmallComponent} />
        ) : (
          <AssetInforEquity isSmallComponent={isSmallComponent} />
        )}
      </div>
    );

    return (
      <div className={styles.AssetInformation}>
        <TabTable
          data={assetManagementTab(
            AccountRoutes.ASSET_MANAGEMENT,
            RenderItem,
            this.props.selectedAccount?.type
          )}
          onSelect={this.onSelect}
        />
      </div>
    );
  }

  private onSelect = (eventKey: string) => {
    this.props.history.push(`/${Routes.ACCOUNT}/${eventKey}`);
  };
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {};

const AssetInformation = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(AssetInformationComponent)
    ),
    Fallback,
    handleError
  )
);

export default AssetInformation;
