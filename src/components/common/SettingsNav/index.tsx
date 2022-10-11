import * as React from 'react';
import * as styles from './styles.scss';
import { CandleType, LocationBisAskUI } from 'constants/enum';
import { IState } from 'redux/global-reducers';
import { Overlay, Popover } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router';
import { SettingSVG } from 'assets/svg';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeLocationBidAsk } from './actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';

export interface ISettingsProps
  extends React.ClassAttributes<ISettingsProps>,
    WithNamespaces,
    RouteComponentProps {
  readonly settingsNav: IState['settingsNav'];

  readonly changeLocationBidAsk: typeof changeLocationBidAsk;
}

export interface ISettingsNavState {
  readonly isPopoverShown: boolean;
  readonly txtCandleType: CandleType;
  readonly txtLocationBidAsk: LocationBisAskUI;
}

class SettingsNav extends React.Component<ISettingsProps, ISettingsNavState> {
  private localSettinggRef: React.RefObject<HTMLImageElement>;

  constructor(props: ISettingsProps) {
    super(props);

    this.state = {
      isPopoverShown: false,
      txtCandleType: CandleType.HIGHT_LOW_CANDLE,
      txtLocationBidAsk: props.settingsNav,
    };

    this.localSettinggRef = React.createRef();
  }

  render() {
    const { t } = this.props;

    return (
      <div className={styles.SettingsNav} ref={this.localSettinggRef}>
        <SettingSVG onClick={this.onTriggerPopover} />
        <Overlay
          show={this.state.isPopoverShown}
          placement="bottom"
          rootClose={true}
          container={this.localSettinggRef}
          target={this.localSettinggRef}
          onHide={this.onHidePopover}
        >
          <Popover id="popover-settings" className={styles.SettingsDropdown}>
            <div hidden>
              <p className={styles.InforTitle}>{t('Candle Type')}</p>
              <div className={styles.InforRadio}>
                <p>
                  <input
                    type="radio"
                    name={CandleType.HIGHT_LOW_CANDLE}
                    value={CandleType.HIGHT_LOW_CANDLE}
                    id={CandleType.HIGHT_LOW_CANDLE}
                    onChange={this.radioCandleType}
                    checked={
                      this.state.txtCandleType === CandleType.HIGHT_LOW_CANDLE
                    }
                  />
                  <label htmlFor={CandleType.HIGHT_LOW_CANDLE}>
                    {t(CandleType.HIGHT_LOW_CANDLE)}
                  </label>
                </p>
                <p>
                  <input
                    type="radio"
                    name={CandleType.CELING_FLOOR_CANDLE}
                    value={CandleType.CELING_FLOOR_CANDLE}
                    id={CandleType.CELING_FLOOR_CANDLE}
                    onChange={this.radioCandleType}
                    checked={
                      this.state.txtCandleType ===
                      CandleType.CELING_FLOOR_CANDLE
                    }
                  />
                  <label htmlFor={CandleType.CELING_FLOOR_CANDLE}>
                    {t(CandleType.CELING_FLOOR_CANDLE)}
                  </label>
                </p>
              </div>
            </div>
            <div>
              <p className={styles.InforTitle}>{t('BID_ASK_POSITION')}</p>
              <div className={styles.InforRadio}>
                <p>
                  <input
                    type="radio"
                    name={LocationBisAskUI.ASK_BID}
                    value={LocationBisAskUI.ASK_BID}
                    id={LocationBisAskUI.ASK_BID}
                    onChange={this.radioLocationBidAsk}
                    checked={
                      this.state.txtLocationBidAsk === LocationBisAskUI.ASK_BID
                    }
                  />
                  <label
                    className={`${styles.BidAsk} ${styles.AskBid}`}
                    htmlFor={LocationBisAskUI.ASK_BID}
                  >
                    <p>{t('Ask')}</p>
                    <p>{t('Bid')}</p>
                  </label>
                </p>
                <p>
                  <input
                    type="radio"
                    name={LocationBisAskUI.BID_ASK}
                    value={LocationBisAskUI.BID_ASK}
                    id={LocationBisAskUI.BID_ASK}
                    onChange={this.radioLocationBidAsk}
                    checked={
                      this.state.txtLocationBidAsk === LocationBisAskUI.BID_ASK
                    }
                  />
                  <label
                    className={styles.BidAsk}
                    htmlFor={LocationBisAskUI.BID_ASK}
                  >
                    <p>{t('Bid')}</p>
                    <p>{t('Ask')}</p>
                  </label>
                </p>
              </div>
            </div>
            <div className={styles.ButtonSection}>
              <button
                className={styles.CancelButton}
                type="button"
                onClick={this.onHidePopover}
              >
                {t('Cancel')}
              </button>
              <button
                className={styles.SubmitButton}
                type="button"
                onClick={this.onSubmitSetting}
              >
                {t('Save')}
              </button>
            </div>
          </Popover>
        </Overlay>
      </div>
    );
  }

  private radioCandleType = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      txtCandleType: event.target.value as CandleType,
    });
  };

  private radioLocationBidAsk = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState(
      {
        txtLocationBidAsk: event.target.value as LocationBisAskUI,
      },
      () => {
        this.props.changeLocationBidAsk(this.state.txtLocationBidAsk);
      }
    );
  };

  private onSubmitSetting = () => {
    this.setState({ isPopoverShown: false });
  };

  private onTriggerPopover = () => {
    this.setState({ isPopoverShown: !this.state.isPopoverShown });
  };

  private onHidePopover = () => {
    this.setState({ isPopoverShown: false });
  };
}

const mapStateToProps = (state: IState) => ({
  settingsNav: state.settingsNav,
});

const mapDispatchToProps = { changeLocationBidAsk };

export default withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(SettingsNav)
    ),
    Fallback,
    handleError
  )
);
