import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Big } from 'big.js';
import { DatabaseSVG, DollarSVG, PercentageSVG } from 'assets/svg';
import { Fallback } from 'components/common';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { OrderType, SymbolType } from 'constants/enum';
import { Overlay, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PERCENTAGE_LIST, QUANTITY_LIST } from 'constants/main';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError } from 'utils/common';
import { getMinLot, roundLot } from 'utils/market';
import { queryOrderStockInfo } from '../OrderForm/actions';
import { withErrorBoundary } from 'react-error-boundary';
import NumericInput from '../NumericInput';

interface IQuantityInputProps
  extends React.ClassAttributes<QuantityInputComponent>,
    WithNamespaces {
  readonly value?: number;
  readonly data?: INewSymbolData;
  readonly percentage?: number;
  readonly quantityType?: 'share' | 'amount' | 'percentage';
  readonly popupPosition?: 'left' | 'right';
  readonly disablePopup?: boolean;
  readonly disableQuantityType?: boolean;
  readonly disableQuantityTypes?: Array<'share' | 'amount' | 'percentage'>;
  readonly maxQty?: number;
  readonly error?: boolean;
  readonly isOddlot?: boolean;
  readonly orderType?: OrderType;

  readonly onChange?: (
    value: number | undefined,
    quantityType: IQuantityInputState['quantityType'],
    percentage?: number
  ) => void;
  readonly onBlur?: (value: number | undefined) => void;
  readonly queryOrderStockInfo: typeof queryOrderStockInfo;
}

interface IQuantityInputState {
  readonly quantityType: 'share' | 'amount' | 'percentage';
  readonly isQuantityListShown: boolean;
  readonly value?: number;
  readonly percentage?: number;
  readonly isTooltipShown?: boolean;
  readonly isInputFocus?: boolean;
}

class QuantityInputComponent extends React.Component<
  IQuantityInputProps,
  IQuantityInputState
> {
  private inputRef?: React.RefObject<HTMLDivElement>;

  constructor(props: IQuantityInputProps) {
    super(props);

    this.state = {
      quantityType: 'share',
      isQuantityListShown: false,
      value: props.value ?? getMinLot(props.data?.m, props.data?.t),
    };

    this.inputRef = React.createRef();
  }

  static getDerivedStateFromProps(
    nextProps: IQuantityInputProps,
    prevState: IQuantityInputState
  ): Partial<IQuantityInputState> | null {
    return {
      ...prevState,
      ...(nextProps.value !== prevState.value && { value: nextProps.value }),
      ...(nextProps.percentage !== prevState.percentage && {
        percentage: nextProps.percentage,
      }),
      ...(nextProps.quantityType !== prevState.quantityType && {
        quantityType: nextProps.quantityType,
      }),
    };
  }

  render() {
    const { t } = this.props;
    const isPercentageType = this.state.quantityType === 'percentage';
    return (
      <div
        className={classNames(styles.QuantityInput, {
          [styles.Right]: this.props.popupPosition === 'right',
        })}
      >
        <NumericInput
          onClick={this.onInputFocus}
          onBlur={this.onInputBlur}
          value={isPercentageType ? this.state.percentage : this.state.value}
          onNumberChange={this.onInputChange}
          disabled={this.state.quantityType === 'amount'}
          min={0}
          max={isPercentageType ? 100 : this.props.maxQty}
          onParse={isPercentageType ? this.onParse : undefined}
          onFormat={isPercentageType ? this.onFormat : undefined}
          step={
            this.props.isOddlot || isPercentageType
              ? 1
              : getMinLot(this.props.data?.m, this.props.data?.t)
          }
          error={this.props.error}
          containerRef={this.inputRef}
          onMouseEnter={this.onShowTooltip}
          onMouseOut={this.onHideTooltip}
        />

        {!this.props.disableQuantityType && (
          <div
            className={styles.QuantityFunction}
            onClick={this.onFunctionClick}
          >
            {this.state.quantityType === 'share'
              ? this.quantityFuncTooltip('Shares')
              : isPercentageType
              ? this.quantityFuncTooltip('Percentage')
              : this.quantityFuncTooltip('Value')}
          </div>
        )}

        {!this.props.disablePopup && (
          <div
            className={classNames(styles.QuantityList, {
              [styles.Show]:
                this.state.isQuantityListShown &&
                this.state.quantityType !== 'amount',
            })}
          >
            <table>
              <tbody>
                {this.state.quantityType === 'share'
                  ? QUANTITY_LIST[
                      this.props.orderType === OrderType.ODDLOT
                        ? 'oddLot'
                        : this.props.data?.t === SymbolType.FUTURES
                        ? 1
                        : 100
                    ].map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => {
                          const onCellClick = () =>
                            this.onSelectQuantityList(cell);
                          return (
                            <td
                              key={j}
                              onMouseDown={onCellClick}
                              className={classNames('', {
                                [styles.SelectedItem]:
                                  this.props.value === cell,
                              })}
                            >
                              {formatNumber(cell, 3)}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  : isPercentageType
                  ? PERCENTAGE_LIST.map((val, i) => {
                      const onCellClick = () =>
                        this.onSelectPercentageList(val);
                      return (
                        <tr key={i}>
                          <td onMouseDown={onCellClick}>{`${val}%`}</td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
        )}

        {isPercentageType && (
          <Overlay
            target={this.inputRef?.current as any}
            show={this.state.isTooltipShown}
            container={this.inputRef?.current}
            placement="top"
          >
            {(props) => (
              <Tooltip id={styles.NumericInputTooltip} {...props}>
                {`${t('Est.Qty')}: ${formatNumber(this.props.value)}`}
              </Tooltip>
            )}
          </Overlay>
        )}
      </div>
    );
  }

  private onInputFocus = () => {
    this.setState({
      isQuantityListShown: true,
      isTooltipShown: true,
      isInputFocus: true,
    });
  };

  private onInputChange = (value: number | undefined, stringValue: string) => {
    if (this.state.quantityType === 'percentage') {
      this.setState({ percentage: value }, () => {
        const inputValue = this.getInputValue(
          this.state.value,
          value,
          this.props.data,
          this.state.quantityType,
          this.props.maxQty
        );
        this.props.onChange?.(inputValue, this.state.quantityType, value);
      });
    } else {
      this.setState({ value }, () => {
        this.props.onChange?.(
          value,
          this.state.quantityType,
          this.state.percentage
        );
      });
    }
  };

  private onSelectQuantityList = (value?: number) => {
    this.setState({ value }, () => {
      this.props.onChange?.(value, this.state.quantityType);
    });
  };

  private onSelectPercentageList = (percentage?: number) => {
    const value = this.getInputValue(
      this.state.value,
      percentage,
      this.props.data,
      this.state.quantityType,
      this.props.maxQty
    );

    this.setState({ value, percentage }, () => {
      this.props.onChange?.(value, this.state.quantityType, percentage);
    });
  };

  private onFunctionClick = () => {
    this.changeQuantityType();
  };

  private changeQuantityType = () => {
    let quantityTypes: IQuantityInputProps['disableQuantityTypes'] = [
      'share',
      'percentage',
      'amount',
    ];
    quantityTypes = quantityTypes.filter(
      (val) => !this.props.disableQuantityTypes?.includes(val)
    );
    const currentIndex = quantityTypes.findIndex(
      (val) => val === this.state.quantityType
    );
    const nextQuantityType =
      quantityTypes[
        currentIndex === quantityTypes.length - 1 ? 0 : currentIndex + 1
      ];

    const value = this.props.isOddlot
      ? getMinLot(this.props.data?.m, this.props.data?.t, this.props.isOddlot)
      : this.getInputValue(
          this.state.value,
          this.state.percentage,
          this.props.data,
          nextQuantityType,
          this.props.maxQty
        );
    this.setState(
      {
        quantityType: nextQuantityType,
        value,
      },
      () => {
        this.props.onChange?.(value, nextQuantityType, this.state.percentage);
      }
    );
  };

  private onInputBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLDivElement>
  ) => {
    event.stopPropagation();
    const value = this.getInputValue(
      Number(this.state.value) > 0 ? this.state.value : 0,
      this.state.percentage,
      this.props.data,
      this.state.quantityType,
      this.props.maxQty
    );
    this.setState(
      {
        isQuantityListShown: false,
        isTooltipShown: false,
        isInputFocus: false,
        value,
      },
      () => {
        this.props.onChange?.(
          value,
          this.state.quantityType,
          this.state.percentage
        );
        this.props.onBlur?.(value);
      }
    );
  };

  private onFormat = (value: number | null) => {
    return value + '%';
  };

  private onParse = (stringValue: string) => {
    return parseFloat(stringValue.replace(/%/g, ''));
  };

  private onShowTooltip = () => {
    this.setState({ isTooltipShown: true });
  };

  private onHideTooltip = () => {
    if (!this.state.isInputFocus) {
      this.setState({ isTooltipShown: false });
    }
  };

  private quantityFuncTooltip = (value: string) => {
    return (
      <OverlayTrigger
        key={value}
        placement={'top'}
        overlay={
          <Tooltip id={styles.QuantityBgColor}>{this.props.t(value)}</Tooltip>
        }
      >
        <div className={styles.QuantityTooltip}>
          {value === 'Shares' ? (
            <DatabaseSVG height={10} />
          ) : value === 'Value' ? (
            <DollarSVG height={12} />
          ) : (
            <PercentageSVG height={14} />
          )}
        </div>
      </OverlayTrigger>
    );
  };

  private getInputValue = (
    inputValue?: number,
    percentage?: number,
    symbol?: INewSymbolData,
    quantityType?: IQuantityInputState['quantityType'],
    maxQty?: number
  ) => {
    let value = inputValue;
    const minLot = getMinLot(symbol?.m, symbol?.t);

    if (this.props.isOddlot && symbol) {
      return inputValue;
    }

    if (quantityType === 'percentage') {
      value =
        symbol != null && percentage != null && maxQty != null
          ? roundLot(
              +Big(percentage).times(maxQty).div(100),
              symbol.m,
              symbol.t,
              undefined,
              true
            )
          : 0;
    } else {
      value = symbol
        ? inputValue != null
          ? inputValue >= minLot
            ? roundLot(inputValue, symbol.m, symbol.t, undefined, true)
            : minLot
          : minLot
        : inputValue;
    }

    return value;
  };
}

const mapStateToProps = (state: IState) => ({});

const mapDispatchToProps = {
  queryOrderStockInfo,
};

const QuantityInput = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(QuantityInputComponent)
  ),
  Fallback,
  handleError
);

export default QuantityInput;
