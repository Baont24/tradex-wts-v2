import * as React from 'react';
import * as styles from './styles.scss';
import { FaTimes } from 'react-icons/fa';
import { Fallback } from 'components/common';
import { ICellRendererParams } from 'ag-grid-community';
import { IState } from 'redux/global-reducers';
import { IStopOrderHistoryResponse } from 'interfaces/api';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PenSVG } from 'assets/svg';
import { StopOrderStatus } from 'constants/enum';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface IEditCellProps
  extends React.ClassAttributes<ICellRendererParams>,
    WithNamespaces {
  readonly data: IStopOrderHistoryResponse;
  readonly onClickEdit?: (data: IStopOrderHistoryResponse) => void;
  readonly onClickDelete?: (data: IStopOrderHistoryResponse) => void;
}

class EditCellComponent extends React.Component<IEditCellProps> {
  constructor(props: IEditCellProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t } = this.props;
    return (
      <div className={styles.EditCell}>
        {this.props.data.status === StopOrderStatus.PENDING && (
          <>
            <div className={styles.EditButton} onClick={this.onClickEdit}>
              <OverlayTrigger
                key="Modify"
                overlay={<Tooltip id={`tooltip-Modify`}>{t('Modify')}</Tooltip>}
              >
                <PenSVG width={12} />
              </OverlayTrigger>
            </div>
            <div className={styles.DeleteButton} onClick={this.onClickDelete}>
              <OverlayTrigger
                key="Cancel"
                overlay={<Tooltip id={`tooltip-Cancel`}>{t('Cancel')}</Tooltip>}
              >
                <FaTimes size={16} />
              </OverlayTrigger>
            </div>
          </>
        )}
      </div>
    );
  }

  private onClickEdit = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    this.props.onClickEdit?.(this.props.data);
  };

  private onClickDelete = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    this.props.onClickDelete?.(this.props.data);
  };
}

const mapStateToProps = (state: IState) => ({});

const mapDispatchToProps = {};

const EditCell = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(EditCellComponent)
  ),
  Fallback,
  handleError
);

export default EditCell;
