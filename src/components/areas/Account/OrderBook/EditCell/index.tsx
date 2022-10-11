import * as React from 'react';
import * as styles from './styles.scss';
import { FaTimes } from 'react-icons/fa';
import { Fallback } from 'components/common';
import { ICellRendererParams } from 'ag-grid-community';
import { IOrderBookReducer } from 'interfaces/reducers';
import { IState } from 'redux/global-reducers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PenSVG } from 'assets/svg';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import classNames from 'classnames';

interface IEditCellProps
  extends React.ClassAttributes<ICellRendererParams>,
    WithNamespaces {
  readonly data: IOrderBookReducer;
  readonly onClickEdit?: (data: IOrderBookReducer) => void;
  readonly onClickDelete?: (data: IOrderBookReducer) => void;
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
        {this.props.data.modifiable && (
          <button className={styles.EditButton} onClick={this.onClickEdit}>
            <OverlayTrigger
              key="Modify"
              overlay={<Tooltip id={`tooltip-Modify`}>{t('Modify')}</Tooltip>}
            >
              <PenSVG width={12} />
            </OverlayTrigger>
          </button>
        )}
        {this.props.data.cancellable && (
          <button
            className={classNames(styles.DeleteButton, {
              [styles.MarginLeft]: !this.props.data.modifiable,
            })}
            onClick={this.onClickDelete}
          >
            <OverlayTrigger
              key="Cancel"
              overlay={<Tooltip id={`tooltip-Cancel`}>{t('Cancel')}</Tooltip>}
            >
              <FaTimes size={16} />
            </OverlayTrigger>
          </button>
        )}
      </div>
    );
  }

  private onClickEdit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    this.props.onClickEdit?.(this.props.data);
  };

  private onClickDelete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
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
