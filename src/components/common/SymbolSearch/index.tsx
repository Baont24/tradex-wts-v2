import 'react-select/dist/react-select.css';
import 'react-virtualized-select/styles.css';
import 'react-virtualized/styles.css';
import * as React from 'react';
import * as _ from 'lodash';
import * as styles from './styles.scss';
import { AllSubstringsIndexStrategy } from 'js-search';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { Lang, Market, SymbolType, SystemType } from 'constants/enum';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Fallback from '../Fallback';
import ReactSelectClass, { FilterOptionsHandler } from 'react-select';
import VirtualizedSelect, {
  VirtualizedOptionRenderOptions,
} from 'react-virtualized-select';
import classNames from 'classnames';
import createFilterOptions from 'react-select-fast-filter-options';

interface ISymbolSearchProps
  extends React.ClassAttributes<SymbolSearchComponent> {
  readonly symbolList: IState['symbolList'];
  readonly lang: IState['lang'];
  readonly style?: string;
  readonly isClearable?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string | JSX.Element;
  readonly selectedAccount: IState['selectedAccount'];
  readonly icon?: boolean;
  readonly inputValue?: string;
  readonly isForm?: boolean;
  readonly horizontalPosition?: 'left' | 'right';
  readonly verticalPosition?: 'top' | 'bottom';
  readonly removeIndexStock?: boolean;
  readonly isHOSEtoHSX?: boolean;

  readonly symbolSearchRef?: (ref?: ReactSelectClass<INewSymbolData>) => void;
  readonly onSymbolSearch?: (code: string | null) => void;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
  readonly onFocusInput?: () => void;
  readonly onBlurInput?: () => void;
}

interface ISymbolSearchState {
  readonly selectedValue?: INewSymbolData | null;
}

class SymbolSearchComponent extends React.Component<
  ISymbolSearchProps,
  ISymbolSearchState
> {
  static defaultProps: Partial<ISymbolSearchProps> = {
    isClearable: false,
    icon: true,
  };

  private searchBoxRef: React.RefObject<HTMLDivElement>;
  private inputRef: React.RefObject<VirtualizedSelect<INewSymbolData>>;
  private localSelectRef?: ReactSelectClass<INewSymbolData>;
  private localData: INewSymbolData[] = [];
  private localFilterOptions: FilterOptionsHandler;

  constructor(props: ISymbolSearchProps) {
    super(props);

    this.localData = this.sortSymbol(
      props.symbolList.array,
      props.selectedAccount?.type
    );

    this.localFilterOptions = createFilterOptions({
      indexes: ['s'],
      indexStrategy: new AllSubstringsIndexStrategy(),
      labelKey: this.props.lang === Lang.VI ? 'n1' : 'n2',
      valueKey: 's',
      options: this.localData,
    });

    this.searchBoxRef = React.createRef();
    this.inputRef = React.createRef();

    this.state = {};
  }

  componentDidMount() {
    this.localSelectRef = (this.inputRef.current as any)?._selectRef;
    this.props.symbolSearchRef?.(this.localSelectRef);
  }

  shouldComponentUpdate(nextProps: ISymbolSearchProps) {
    if (
      this.props.symbolList !== nextProps.symbolList ||
      this.props.selectedAccount !== nextProps.selectedAccount
    ) {
      this.localData = this.sortSymbol(
        nextProps.symbolList.array,
        nextProps.selectedAccount?.type
      );

      this.localFilterOptions = createFilterOptions({
        indexes: ['s'],
        indexStrategy: new AllSubstringsIndexStrategy(),
        labelKey: this.props.lang === Lang.VI ? 'n1' : 'n2',
        valueKey: 's',
        options: this.localData,
      });
    }

    if (
      this.props.inputValue !== nextProps.inputValue &&
      nextProps.inputValue?.trim()
    ) {
      this.localSelectRef?.focus();
    }

    return true;
  }

  render() {
    return (
      <div
        ref={this.searchBoxRef}
        className={classNames(this.props.style, {
          [styles.SearchSymbolClearable]: this.props.isClearable,
          [styles.SearchSymbol]: !this.props.isClearable,
          [styles.SearchSymbolForm]: this.props.isForm,
          [styles.SearchSymbolRight]: this.props.horizontalPosition === 'right',
          [styles.SearchSymbolTop]: this.props.verticalPosition === 'top',
          [styles.disabled]: this.props.disabled,
        })}
        onClick={this.onFocus}
        onBlur={this.onBlur}
      >
        <VirtualizedSelect
          disabled={this.props.disabled}
          optionHeight={40}
          options={this.localData}
          filterOptions={this.localFilterOptions}
          onChange={this.onChange}
          optionRenderer={this.optionRenderer as any}
          valueKey="s"
          labelKey={this.props.lang === Lang.VI ? 'n1' : 'n2'}
          placeholder={this.props.placeholder}
          clearable={this.props.isClearable}
          ref={this.inputRef as any}
          onFocus={this.props.onFocusInput}
          onBlur={this.props.onBlurInput}
        />
        {this.props.isClearable && this.state.selectedValue != null && (
          <FaTimes
            className={styles.ClearIcon}
            size={12}
            onClick={this.onClear}
          />
        )}
        {this.props.icon ? (
          <FaSearch className={styles.SearchIcon} />
        ) : (
          <FaTimes className={styles.SearchIcon} onClick={this.onClear} />
        )}
      </div>
    );
  }

  private sortSymbol = (data?: INewSymbolData[], systemType?: SystemType) => {
    let mutableSymbol = _.orderBy(
      data,
      ['t', 'm', 's'],
      ['desc', 'asc', 'asc']
    );

    if (systemType === SystemType.DERIVATIVES) {
      mutableSymbol = _.orderBy(
        data,
        ['r', 't', 'm', 's'],
        ['asc', 'desc', 'asc', 'asc']
      );
      mutableSymbol = mutableSymbol
        .slice(0)
        .sort((a) =>
          a.s.startsWith('VN') && a.t === SymbolType.FUTURES ? -1 : 0
        );
    }

    if (this.props.removeIndexStock) {
      mutableSymbol = mutableSymbol.filter((val) => val.t !== SymbolType.INDEX);
    }

    return mutableSymbol;
  };

  private onBlur = () => {
    this.searchBoxRef.current?.classList.remove('Placeholder');

    if (this.props.onBlur) {
      this.props.onBlur();
    }
  };

  private onFocus = () => {
    if (!this.props.disabled) {
      this.searchBoxRef.current?.classList.add('Placeholder');
    }

    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  private onClear = () => {
    this.setState({ selectedValue: null }, () => {
      this.props.onSymbolSearch?.(null);
    });
  };

  private onChange = (data: INewSymbolData) => {
    if (data && data.s) {
      this.setState(
        {
          selectedValue: data,
        },
        () => {
          if (this.props.onSymbolSearch) {
            this.props.onSymbolSearch(data.s);
          }
          this.searchBoxRef.current?.classList.remove('Placeholder');
        }
      );
    } else {
      this.setState({ selectedValue: null }, () => {
        if (this.props.onSymbolSearch) {
          this.props.onSymbolSearch(null);
        }
      });
    }
  };

  private optionRenderer = (
    options: VirtualizedOptionRenderOptions<INewSymbolData>
  ) => {
    const data = options.option;
    const onClick = () => options.selectValue({ s: data.s, t: data.t });
    const onMouseEnter = () => options.focusOption({ s: data.s, t: data.t });
    const companyName = this.props.lang === Lang.VI ? data.n1 : data.n2;
    return (
      <div
        style={options.style}
        className={classNames(styles.Row, {
          [styles.Highlight]: options.focusedOption.s === data.s,
        })}
        key={options.key}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        <div className={styles.Code} title={data.s}>
          {data.s}
        </div>
        <div className={styles.MarketText}>
          <span className={data.m}>
            {this.props.isHOSEtoHSX && data.m === Market.HOSE ? 'HSX' : data.m}
          </span>
        </div>
        <div
          className={`${styles.CompanyName} ${styles.LineClamp}`}
          title={companyName}
        >
          <span>{companyName}</span>
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state: IState) => ({
  symbolList: state.symbolList,
  lang: state.lang,
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {};

const SymbolSearch = withErrorBoundary(
  connect(mapStateToProps, mapDispatchToProps)(SymbolSearchComponent),
  Fallback,
  handleError
);

export default SymbolSearch;
