import * as React from 'react';
import * as styles from './styles.scss';
import { FlagVi } from 'assets/svg';
import { IState } from 'redux/global-reducers';
import { LANGUAGES } from 'constants/main';
import { Lang } from 'constants/enum';
import { Overlay, Popover } from 'react-bootstrap';
import { changeLanguage } from './actions';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';
import classNames from 'classnames';

export interface ILanguageSwitcherProps {
  readonly lang: Lang;
  readonly isPopover: boolean;

  readonly changeLanguage: (data: Lang) => void;
}

export interface ILanguageSwitcherState {
  readonly isPopoverShown: boolean;
}

class LanguageSwitcher extends React.Component<
  ILanguageSwitcherProps,
  ILanguageSwitcherState
> {
  static defaultProps = {
    isPopover: true,
  };

  private localFlagRef: React.RefObject<HTMLImageElement>;

  constructor(props: ILanguageSwitcherProps) {
    super(props);

    this.state = {
      isPopoverShown: false,
    };

    this.localFlagRef = React.createRef();
  }

  render() {
    const selectedLang = LANGUAGES.find((val) => val.value === this.props.lang);

    return (
      <div className={styles.LanguageSwitcher} ref={this.localFlagRef}>
        {this.props.isPopover ? (
          <div onClick={this.onTriggerPopover}>
            {selectedLang ? <selectedLang.flag /> : <FlagVi />}
          </div>
        ) : (
          LANGUAGES.map((val, idx) => {
            const onClickLang = () => this.props.changeLanguage(val.value);
            return (
              <div
                key={idx}
                defaultValue={val.value}
                className={classNames(styles.LanguageItem, {
                  [styles.Active]: this.props.lang === val.value,
                })}
                onClick={onClickLang}
              >
                <val.flag />
              </div>
            );
          })
        )}
        <Overlay
          show={this.state.isPopoverShown}
          placement="bottom"
          rootClose={true}
          container={this.localFlagRef}
          target={this.localFlagRef}
          onHide={this.onHidePopover}
        >
          <Popover id="popover-lang" className={styles.LanguageDropdown}>
            {LANGUAGES.map((val, idx) => {
              const onClickLang = () => {
                this.props.changeLanguage(val.value);
                this.onHidePopover();
              };
              return (
                <div
                  key={idx}
                  defaultValue={val.value}
                  className={classNames(styles.LanguageItem, {
                    [styles.Active]: this.props.lang === val.value,
                  })}
                  onClick={onClickLang}
                >
                  <val.flag />
                  <span>{val.text}</span>
                </div>
              );
            })}
          </Popover>
        </Overlay>
      </div>
    );
  }

  private onTriggerPopover = () => {
    this.setState({ isPopoverShown: !this.state.isPopoverShown });
  };

  private onHidePopover = () => {
    this.setState({ isPopoverShown: false });
  };
}

const mapStateToProps = (state: IState) => ({
  lang: state.lang,
});

const mapDispatchToProps = {
  changeLanguage,
};

export default withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(LanguageSwitcher),
  Fallback,
  handleError
);
