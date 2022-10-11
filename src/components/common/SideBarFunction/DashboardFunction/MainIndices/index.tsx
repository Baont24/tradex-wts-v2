import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { CheckBox, Fallback, IndexBoard, ScrollBar } from 'components/common';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';
import { INewSymbolData } from 'interfaces/market';
import { IState } from 'redux/global-reducers';
import { Overlay, Popover } from 'react-bootstrap';
import { RealtimeChannelDataType, SymbolType } from 'constants/enum';
import { SettingSVG } from 'assets/svg';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { queryIndexData, subscribe, unsubscribe } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';

interface IMainIndiceProps
  extends React.ClassAttributes<MainIndiceComponent>,
    WithNamespaces {
  readonly symbolList: IState['symbolList'];
  readonly indexList: IState['indexList'];
  readonly resetBoardDataTrigger: IState['resetBoardDataTrigger'];
  readonly resetMarketDataTrigger: IState['resetMarketDataTrigger'];
  readonly collapsed?: boolean;

  readonly subscribe: typeof subscribe;
  readonly unsubscribe: typeof unsubscribe;
  readonly queryIndexData: typeof queryIndexData;
  readonly onCollapse: () => void;
}

interface IMainIndiceState {
  readonly tabKey: INewSymbolData['it'];
  readonly isPopoverShown: boolean;
}

class MainIndiceComponent extends React.Component<
  IMainIndiceProps,
  IMainIndiceState
> {
  private localGridApi?: GridApi;
  private localIndexList: INewSymbolData[] = [];
  private localIndexListHidden: string[] = [];
  private localFlagRef: React.RefObject<HTMLImageElement>;

  constructor(props: IMainIndiceProps) {
    super(props);

    this.state = {
      tabKey: 'D',
      isPopoverShown: false,
    };

    this.localFlagRef = React.createRef();
    this.localIndexList = this.props.indexList.filter(
      (val) => val.it === this.state.tabKey
    );
    this.localIndexList = this.localIndexList
      .filter((val) => val.i)
      .concat(this.localIndexList.filter((val) => !val.i));
  }

  componentDidMount() {
    this.queryIndexData(this.localIndexList);
  }

  shouldComponentUpdate(
    nextProps: IMainIndiceProps,
    nextState: IMainIndiceState
  ) {
    if (
      nextState.tabKey !== this.state.tabKey ||
      nextProps.resetBoardDataTrigger !== this.props.resetBoardDataTrigger ||
      nextProps.resetMarketDataTrigger !== this.props.resetMarketDataTrigger
    ) {
      let indexList = this.props.indexList.filter(
        (val) => val.it === nextState.tabKey
      );
      indexList = indexList
        .filter((val) => val.i)
        .concat(indexList.filter((val) => !val.i));

      this.queryIndexData(indexList, this.localIndexList);
      this.localIndexList = indexList;
    }

    return true;
  }

  componentWillUnmount() {
    this.props.unsubscribe({
      symbolList: this.localIndexList,
      types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
      symbolType: SymbolType.INDEX,
    });
  }

  render() {
    return (
      <div className={styles.MainIndice}>
        <IndexBoard
          indexType="main-index"
          indexListSlider={this.localIndexList}
          tabKey={this.state.tabKey}
          onSelectTab={this.onSelectTab}
          headerHeight={0}
          rowHeight={26}
          columnDefType="F"
          isExternalFilterPresent={this.isExternalFilterPresent}
          doesExternalFilterPass={this.doesExternalFilterPass}
          onGridReady={this.onGridReady}
        />
        <div
          className={classNames(styles.SettingButton, {
            [styles.Active]: this.state.isPopoverShown,
          })}
          onClick={this.onTriggerPopover}
          ref={this.localFlagRef}
        >
          <SettingSVG />
        </div>
        <div className={styles.CollapseButton} onClick={this.props.onCollapse}>
          {this.props.collapsed ? <FaCaretDown /> : <FaCaretUp />}
        </div>
        <Overlay
          show={this.state.isPopoverShown}
          onHide={this.onHidePopover}
          placement="bottom"
          rootClose={true}
          container={this.localFlagRef}
          target={this.localFlagRef}
        >
          <Popover id={styles.PopoverMainIndex}>
            <ScrollBar autoHide={true}>
              {this.localIndexList.map((val, idx) => {
                const onCheckBoxChange = (value: boolean) =>
                  this.onSettingChange(val.s, value);
                const checked = this.localIndexListHidden.find(
                  (el) => el === val.s
                );
                return (
                  <div key={idx} className={styles.IndexItem}>
                    <CheckBox
                      label={val.n1}
                      onChange={onCheckBoxChange}
                      checked={!checked}
                    />
                  </div>
                );
              })}
            </ScrollBar>
          </Popover>
        </Overlay>
      </div>
    );
  }

  private onSelectTab = (eventKey: INewSymbolData['it']) => {
    this.setState({ tabKey: eventKey });
  };

  private onTriggerPopover = () => {
    this.setState({ isPopoverShown: !this.state.isPopoverShown });
  };

  private onHidePopover = () => {
    this.setState({ isPopoverShown: false });
  };

  private onSettingChange = (code: string, isShown?: boolean) => {
    this.localIndexListHidden = isShown
      ? this.localIndexListHidden.filter((val) => val !== code)
      : [...this.localIndexListHidden, code];
    this.localGridApi?.onFilterChanged();
  };

  private isExternalFilterPresent = () => {
    return true;
  };

  private doesExternalFilterPass = (node: RowNode) => {
    return !this.localIndexListHidden.includes(node.id || '');
  };

  private onGridReady = (event: GridReadyEvent) => {
    this.localGridApi = event.api;
  };

  private queryIndexData = (
    indexList: INewSymbolData[],
    prevIndexList?: INewSymbolData[]
  ) => {
    if (indexList.length > 0) {
      this.props.queryIndexData({
        symbolList: indexList.map((el) => el.s),
        indexType: 'main-index',
      });
      if (prevIndexList != null) {
        this.props.unsubscribe({
          symbolList: prevIndexList,
          types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
          symbolType: SymbolType.INDEX,
        });
      }

      this.props.subscribe({
        symbolList: indexList,
        types: [RealtimeChannelDataType.QUOTE, RealtimeChannelDataType.EXTRA],
        symbolType: SymbolType.INDEX,
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  symbolList: state.symbolList,
  indexList: state.indexList,
  resetMarketDataTrigger: state.resetMarketDataTrigger,
  resetBoardDataTrigger: state.resetBoardDataTrigger,
});

const mapDispatchToProps = {
  subscribe,
  unsubscribe,
  queryIndexData,
};

const MainIndice = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(MainIndiceComponent)
  ),
  Fallback,
  handleError
);

export default MainIndice;
