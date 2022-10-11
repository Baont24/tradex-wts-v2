import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback, Modal } from 'components/common';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface ICancelBtnCellProps
  extends React.ClassAttributes<CancelBtnCellComponent>,
    WithNamespaces {}

interface ICancelBtnCellState {
  readonly isOpenModal: boolean;
}

class CancelBtnCellComponent extends React.Component<
  ICancelBtnCellProps,
  ICancelBtnCellState
> {
  constructor(props: ICancelBtnCellProps) {
    super(props);
    this.state = {
      isOpenModal: false,
    };
  }

  render() {
    const { t } = this.props;
    return (
      <div className={styles.CancelBtnCell}>
        <Modal
          size={'sm'}
          show={this.state.isOpenModal}
          onHide={this.onCloseModal}
          isBackgroundBlur={true}
        >
          <div className={styles.CancelBtnModal}>
            <table>
              <thead>
                <tr>
                  <th colSpan={2}>Right Subscription Cancellation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Account number</td>
                  <td>Dinh Thi Trang Nhung</td>
                </tr>
                <tr>
                  <td>Account No.:</td>
                  <td>077208894M3</td>
                </tr>
                <tr>
                  <td>Symbol Code:</td>
                  <td>077208894M3</td>
                </tr>
                <tr>
                  <td>Company Name:</td>
                  <td>AAAA</td>
                </tr>
                <tr>
                  <td>Securitites Type:</td>
                  <td>Cong ty CP Nhua An Phat Xanh</td>
                </tr>
                <tr>
                  <td>Closed Date:</td>
                  <td>Unlimited transferable type</td>
                </tr>
                <tr>
                  <td>Ratio:</td>
                  <td>3/10/2020</td>
                </tr>
                <tr>
                  <td>Offering Price:</td>
                  <td>5.1</td>
                </tr>
                <tr>
                  <td>Right Qty:</td>
                  <td>12000</td>
                </tr>
                <tr>
                  <td>Register Qty:</td>
                  <td>50</td>
                </tr>
                <tr>
                  <td>Total Amount:</td>
                  <td>12000</td>
                </tr>
              </tbody>
            </table>
            <div className={styles.ButtonSection}>
              <button
                className={styles.SubmitButton}
                type="submit"
                onClick={this.onCloseModal}
              >
                {t('Confirm')}
              </button>
              <button
                className={styles.CancelButton}
                type="button"
                onClick={this.onCloseModal}
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </Modal>
        <button onClick={this.onCloseModal}> {t('Cancel')}</button>
      </div>
    );
  }

  private onCloseModal = () => {
    this.setState({
      isOpenModal: !this.state.isOpenModal,
    });
  };
}

const mapStateToProps = (state: IState) => ({});

const mapDispatchToProps = {};

const CancelBtnCell = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(CancelBtnCellComponent)
  ),
  Fallback,
  handleError
);

export default CancelBtnCell;
