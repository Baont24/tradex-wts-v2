import * as React from 'react';
import * as _ from 'lodash';
import * as styles from './styles.scss';
import { BlockUI, Fallback } from 'components/common';
import { INoRowsOverlayParams } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { resetBoardData } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';

export interface INoRowsOverlayProps
  extends INoRowsOverlayParams,
    WithNamespaces,
    RouteComponentProps<{ readonly key?: string }> {
  readonly boardData: IState['boardData'];

  readonly resetBoardData: typeof resetBoardData;
}

class NoRowsOverlayComponent extends React.Component<INoRowsOverlayProps> {
  constructor(props: INoRowsOverlayProps) {
    super(props);
  }

  render() {
    const { t } = this.props;
    const { isFailed, isLoading } = this.props.boardData.status;

    return (
      <div className={styles.NoRowsOverlay}>
        {isLoading ? (
          <span className="ag-overlay-loading-center">{t('Loading Data')}</span>
        ) : (
          <div
            className={`ag-overlay-no-rows-center ${styles.NoRowsText}`}
          >{`${t('No Rows To Show')}.`}</div>
        )}
        {isFailed && !isLoading && (
          <BlockUI
            className={styles.RefreshData}
            onClick={this.onClick}
            blocking={isLoading}
          >
            {t('Try again')}
          </BlockUI>
        )}
      </div>
    );
  }

  private onClick = () => {
    this.props.resetBoardData();
  };
}

const mapStateToProps = (state: IState) => ({
  boardData: state.boardData,
});

const mapDispatchToProps = {
  resetBoardData,
};

const NoRowsOverlay = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(NoRowsOverlayComponent)
    ),
    Fallback,
    handleError
  )
);

export default NoRowsOverlay;
