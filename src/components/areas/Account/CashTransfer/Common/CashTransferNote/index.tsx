import * as React from 'react';
import * as style from './styles.scss';
import { Accordion, Card } from 'react-bootstrap';
import { Domain } from 'constants/enum';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa';
import { Fallback } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import config from 'config';

export interface ICashTransferNoteProps
  extends React.ClassAttributes<CashTransferNoteComponent>,
    WithNamespaces {
  readonly isVSD?: boolean;
}

export interface ICashTransferNoteState {
  readonly isOpen: boolean;
}
class CashTransferNoteComponent extends React.Component<
  ICashTransferNoteProps,
  ICashTransferNoteState
> {
  constructor(props: ICashTransferNoteProps) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  render() {
    const { t } = this.props;
    return (
      <div className={style.CashTransferNote}>
        {config.domain === Domain.KIS ? (
          <Accordion>
            <Card>
              <Card.Header>
                {this.props.isVSD
                  ? t(
                      'Note: Available time for cash transfer requests is from 08:00 to 15:55 every trading day.'
                    )
                  : t(
                      'Note: Available time for cash transfer requests is from 08:00 to 16:00 every trading day.'
                    )}
              </Card.Header>
            </Card>
          </Accordion>
        ) : (
          <Accordion>
            <Card>
              <Card.Header>
                <Accordion.Toggle eventKey="0" onClick={this.onClickToggle}>
                  {t(
                    'Note: Available time for cash transfer requests is from 08:00 to 16:00 every trading day.'
                  )}
                  {this.state.isOpen ? (
                    <FaAngleDown size={14} />
                  ) : (
                    <FaAngleRight size={14} />
                  )}
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <ul>
                    <li>
                      {t(
                        "For banks are in the same system with MAS: Money will be transferred to customer's account right after the request is sent (VCB, ACB, TCB, Eximbank, Shinhan Bank, Sacombank, Vietinbank)."
                      )}
                    </li>
                    <li>
                      {t(
                        'For banks are not in the same system with MAS: Maximum one working day, depending on the transfer bank.'
                      )}
                    </li>
                  </ul>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        )}
      </div>
    );
  }

  private onClickToggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };
}

const CashTransferNote = withErrorBoundary(
  withNamespaces('common')(CashTransferNoteComponent),
  Fallback,
  handleError
);

export default CashTransferNote;
