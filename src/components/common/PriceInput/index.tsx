import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { DERIVATIVES_ORDER_TYPES, ORDER_TYPES } from 'constants/main';
import { Fallback } from 'components/common';
import { INewSymbolData } from 'interfaces/market';
import { OrderKind, OrderType, SymbolType } from 'constants/enum';
import { getPriceStep } from 'utils/market';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import NumericInput, { NumericInputComponent } from '../NumericInput';

interface IPriceInputProps extends React.ClassAttributes<PriceInputComponent> {
  readonly value?: number;
  readonly data?: INewSymbolData;
  readonly disableOrderType?: boolean;
  readonly error?: boolean;
  readonly orderKind?: OrderKind;
  readonly orderType?: OrderType;
  readonly orderTypes?: Array<{
    readonly label: string;
    readonly value: OrderType;
  }>;
  readonly position?: 'top' | 'bottom';
  readonly isOrderTypeComponent?: boolean;

  readonly onChange?: (value?: number | string) => void;
  readonly onChangeOrderType?: (orderType: OrderType) => void;
  readonly onBlur?: (priceStep?: number) => void;
}

interface IPriceInputState {
  readonly value?: number | string;
  readonly isOrderTypeShown?: boolean;
  readonly priceStep: number;
}

class PriceInputComponent extends React.PureComponent<
  IPriceInputProps,
  IPriceInputState
> {
  static defaultProps = {};

  private localInputRef?: NumericInputComponent;

  constructor(props: IPriceInputProps) {
    super(props);

    this.state = {
      priceStep: 0.1,
    };
  }

  static getDerivedStateFromProps(
    nextProps: IPriceInputProps,
    prevState: IPriceInputState
  ): Partial<IPriceInputState> | null {
    if (nextProps.value !== prevState.value) {
      const { data } = nextProps;
      const value =
        nextProps.value && data?.t !== SymbolType.FUTURES
          ? nextProps.value / 1000
          : nextProps.value;
      const priceStepRaw =
        nextProps.value != null
          ? getPriceStep(nextProps.value, data?.m, data?.t, data?.bs)
          : 100;
      const priceStep =
        data?.t === SymbolType.FUTURES ? priceStepRaw : priceStepRaw / 1000;
      return {
        value,
        priceStep,
      };
    }

    return null;
  }

  render() {
    const { data, orderTypes, orderKind, orderType } = this.props;
    const isOrderType =
      orderType !== OrderType.LO && orderType !== OrderType.ODDLOT;
    const defaultOrderType = data?.m
      ? data.t === SymbolType.FUTURES
        ? DERIVATIVES_ORDER_TYPES[data.m]?.[
            orderKind || OrderKind.NORMAL_ORDER
          ] || []
        : ORDER_TYPES[data.m]?.[orderKind || OrderKind.NORMAL_ORDER] || []
      : [];

    return (
      <div
        className={styles.PriceInput}
        onClick={this.onShowOrderType}
        onBlur={this.onInputBlur}
      >
        <NumericInput
          onClick={this.onInputFocus}
          value={
            orderKind
              ? this.state.value
              : !isOrderType
              ? this.state.value
              : orderType
          }
          onNumberChange={this.onInputChange}
          disabled={orderType ? isOrderType : false}
          inputRef={this.setInputRef}
          error={this.props.error}
          step={this.state.priceStep}
          style={!this.props.isOrderTypeComponent}
        />
        {!this.props.disableOrderType && (
          <div
            className={classNames(styles.OrderTypes, {
              [styles.Show]:
                this.state.isOrderTypeShown &&
                (this.props.isOrderTypeComponent ||
                  orderKind === OrderKind.STOP_LIMIT_ORDER),
              [styles.Top]: this.props.position === 'top',
            })}
          >
            {orderTypes != null
              ? orderTypes.map((val, i) => (
                  <div
                    className={classNames(styles.OrderTypesItem, {
                      [styles.SelectedItem]: this.props.orderType === val.label,
                    })}
                    title={val.value}
                    key={i}
                    onMouseDown={this.onOrderTypeSelect}
                  >
                    {val.label}
                  </div>
                ))
              : defaultOrderType.map((val, i) => (
                  <div
                    className={classNames(styles.OrderTypesItem, {
                      [styles.SelectedItem]: this.props.orderType === val.label,
                    })}
                    title={val.value}
                    key={i}
                    onMouseDown={this.onOrderTypeSelect}
                  >
                    {val.label}
                  </div>
                ))}
          </div>
        )}
        {this.props.isOrderTypeComponent ? (
          <div
            className={classNames(styles.OrderTypeText, {
              [styles.OrderTypeComponent]: this.props.isOrderTypeComponent,
            })}
          >
            {this.props.orderType}
          </div>
        ) : (
          isOrderType && (
            <div
              className={classNames(styles.OrderTypeText, {
                [styles.OrderTypeComponent]: this.props.isOrderTypeComponent,
              })}
            >
              {this.props.orderType}
            </div>
          )
        )}
      </div>
    );
  }

  private onInputChange = (value: number | undefined, stringValue: string) => {
    const symbolType = this.props.data?.t;
    const price =
      value && symbolType !== SymbolType.FUTURES ? value * 1000 : value;
    this.setState({ value }, () => {
      this.props.onChange?.(price);
    });
  };

  private onShowOrderType = () => {
    if (
      this.props.orderType !== OrderType.LO &&
      this.props.orderType !== OrderType.ODDLOT
    ) {
      this.setState({ isOrderTypeShown: true });
    }
  };

  private onInputFocus = (
    event: React.MouseEvent<HTMLInputElement | HTMLDivElement>
  ) => {
    event.stopPropagation();
    this.setState({ isOrderTypeShown: true });
  };

  private onInputBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLDivElement>
  ) => {
    const symbolType = this.props.data?.t;
    const priceStep =
      symbolType === SymbolType.FUTURES
        ? this.state.priceStep
        : this.state.priceStep * 1000;
    event.stopPropagation();
    this.setState(
      {
        isOrderTypeShown: false,
      },
      () => {
        this.props.onBlur?.(priceStep);
      }
    );
  };

  private onOrderTypeSelect = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    const orderType = (event.target as HTMLDivElement).title as OrderType;
    this.setState({ isOrderTypeShown: false }, () => {
      this.props.onChangeOrderType?.(orderType);

      if (orderType !== OrderType.LO && orderType !== OrderType.ODDLOT) {
        this.localInputRef?.setValue();
      }
    });
  };

  private setInputRef = (ref: NumericInputComponent) => {
    this.localInputRef = ref;
  };
}

const PriceInput = withErrorBoundary(
  PriceInputComponent,
  Fallback,
  handleError
);

export default PriceInput;
