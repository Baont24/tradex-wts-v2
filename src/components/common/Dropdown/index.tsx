import * as React from 'react';
import * as styles from './styles.scss';
import { Dropdown as DropdownBootstrap } from 'react-bootstrap';
import { FaCaretDown } from 'react-icons/fa';
import { connect } from 'react-redux';
import { domainConfig } from 'config/domain';
import { handleError } from 'utils/common';
// import { NumericInput } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';
import classNames from 'classnames';
import config from 'config';

interface IDropdownProps
  extends React.ClassAttributes<DropdownComponent>,
    WithNamespaces {
  readonly placeholder?: string;
  readonly active?: boolean;
  readonly data?: Array<{
    readonly title: string;
    readonly value: string;
    readonly params?: { readonly [key: string]: string };
  }>;
  readonly icon?: React.ReactNode;
  readonly activeItem?: string;
  readonly isHover?: boolean;
  readonly className?: string;
  readonly isForm?: boolean;
  readonly disabled?: boolean;
  readonly editable?: boolean;
  readonly tabMode?: boolean;
  readonly isResetInput?: boolean;

  readonly onSelect?: (title: string, value: string) => void;
  readonly onClick?: () => void;
  readonly onCustomToggle?: (isOpen?: boolean) => void;
  readonly onBlur?: () => void;
  readonly onShow?: () => void;
  readonly dropdownRef?: (ref?: DropdownComponent) => void;
}

interface IDropdownState {
  readonly show?: boolean;
  readonly disabled?: boolean;
  readonly value?: string;
  readonly title?: string;
  readonly inputValue?: string;
}

class DropdownComponent extends React.Component<
  IDropdownProps,
  IDropdownState
> {
  constructor(props: IDropdownProps) {
    super(props);

    this.state = {
      disabled: props.disabled,
      value: props.activeItem,
    };
  }

  static getDerivedStateFromProps(
    nextProps: IDropdownProps,
    prevState: IDropdownState
  ): Partial<IDropdownState> | null {
    const title = nextProps.tabMode
      ? undefined
      : nextProps.data?.find((val) => val.value === nextProps.activeItem)
          ?.title;
    return nextProps.activeItem
      ? {
          value: nextProps.activeItem,
          ...(title && { title }),
        }
      : null;
  }
  componentDidMount() {
    this.props.dropdownRef?.(this);
  }
  componentWillUnmount() {
    this.props.dropdownRef?.(undefined);
  }

  render() {
    const { t, placeholder, data, icon, tabMode } = this.props;
    return (
      <>
        <DropdownBootstrap
          className={classNames(styles.Dropdown, this.props.className, {
            [styles.DropdownForm]: this.props.isForm,
            [styles.Disabled]: this.props.disabled,
          })}
          show={this.state.show}
          onToggle={this.onToggle}
          onMouseEnter={this.props.isHover ? this.onShow : undefined}
          onMouseLeave={this.props.isHover ? this.onHide : undefined}
        >
          <DropdownBootstrap.Toggle
            id={`dropdown-${new Date().getTime()}`}
            className={classNames(styles.DropdownToggle, {
              [styles.Active]: this.props.active,
            })}
            onMouseUp={this.props.onClick}
            disabled={this.props.disabled}
          >
            {(!tabMode && this.state.title && (
              <span>{t(this.state.title)}</span>
            )) ||
              (placeholder && <span>{placeholder}</span>)}
            {icon ||
              ((data || this.props.children != null) && (
                <FaCaretDown className={styles.DropdownLogo} />
              ))}
          </DropdownBootstrap.Toggle>

          {(this.props.children && (
            <DropdownBootstrap.Menu
              className={classNames(styles.DropdownMenu, {
                [styles.DropdownMenuVcsc]:
                  domainConfig[config.domain]?.dropdownMenuVcsc,
              })}
            >
              {this.props.children}
            </DropdownBootstrap.Menu>
          )) ||
            (data && (
              <DropdownBootstrap.Menu
                className={classNames(styles.DropdownMenu, {
                  [styles.DropdownMenuVcsc]:
                    domainConfig[config.domain]?.dropdownMenuVcsc,
                })}
                onBlur={this.props.onBlur}
              >
                {data.map((val, idx) => {
                  const onSelectItem = () =>
                    this.onSelect(val.title, val.value);
                  return (
                    <DropdownBootstrap.Item
                      key={idx}
                      onSelect={onSelectItem}
                      active={
                        (tabMode ? this.props.activeItem : this.state.value) ===
                        val.value
                      }
                      className={classNames({
                        [styles.DropdownItemVcsc]:
                          domainConfig[config.domain]?.dropdownItemVcsc,
                      })}
                    >
                      {t(val.title, val.params)}
                    </DropdownBootstrap.Item>
                  );
                })}
                {this.props.editable && (
                  <div className={styles.DropdownEdit}>
                    <input
                      type="number"
                      onChange={this.editDropdown}
                      value={
                        this.props.isResetInput ? '' : this.state.inputValue
                      }
                    />
                  </div>
                )}
              </DropdownBootstrap.Menu>
            ))}
        </DropdownBootstrap>
      </>
    );
  }

  setDisabled = (disabled: boolean) => {
    this.setState({ disabled });
  };

  setValue = (value?: string) => {
    this.setState({ value });
  };

  setShow = (show?: boolean) => {
    this.setState({ show });
  };

  private editDropdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      inputValue: value,
    });
    this.onSelect(value, value);
  };

  private onSelect = (title: string, value: string) => {
    this.setState({ title, value }, () => {
      if (this.props.onSelect) {
        this.props.onSelect(title, value);
      }
    });
  };

  private onToggle = (isOpen: boolean) => {
    if (!isOpen && this.props.onBlur) {
      this.props.onBlur();
    }

    if (this.props.onCustomToggle) {
      this.props.onCustomToggle(isOpen);
    }
  };

  private onShow = () => {
    this.setState({ show: true }, () => {
      this.props.onShow?.();
    });
  };

  private onHide = () => {
    this.setState({ show: false }, () => {
      this.props.onBlur?.();
    });
  };
}

const Dropdown = React.memo(
  withErrorBoundary(
    withNamespaces('common')(connect()(DropdownComponent)),
    Fallback,
    handleError
  )
);

export default Dropdown;
