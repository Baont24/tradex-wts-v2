import * as React from 'react';
import * as styles from './styles.scss';
import {
  BlockUI,
  Fallback,
  Spinner,
  SymbolQuote,
  SymbolSearch,
  TabTable,
} from 'components/common';
import { IState } from 'redux/global-reducers';
import { ITabTableData } from 'interfaces/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { formatNumber, handleError, priceClassRules } from 'utils/common';
import { priceFormatted } from 'utils/board';
import { setCurrentSymbol } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import OrderFunction from 'components/common/SideBarFunction/OrderFunction';

interface IOrderSectionProps
  extends React.ClassAttributes<OrderSectionComponent>,
    WithNamespaces {
  readonly currentSymbolData: IState['currentSymbolData'];
  readonly orderStockInfo: IState['orderStockInfo'];

  readonly setCurrentSymbol: typeof setCurrentSymbol;
}

class OrderSectionComponent extends React.Component<IOrderSectionProps> {
  constructor(props: IOrderSectionProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t, currentSymbolData, orderStockInfo } = this.props;
    const marginRatio = orderStockInfo.data
      ? orderStockInfo.data.marginRatio
      : undefined;
    const matchingHistoryTabs: ITabTableData[] = [
      {
        key: 'matching-history',
        title: t('Matching History'),
        default: true,
        component: currentSymbolData != null && (
          <SymbolQuote data={currentSymbolData} />
        ),
      },
    ];

    return (
      <BlockUI
        className={styles.OrderSection}
        blocking={currentSymbolData == null}
        loader={<Spinner size={50} logo={false} />}
      >
        {currentSymbolData != null && (
          <div className={styles.SymbolSection}>
            <SymbolSearch
              placeholder={
                <span
                  className={priceClassRules(
                    currentSymbolData.c,
                    currentSymbolData
                  )}
                >
                  {currentSymbolData.s}
                </span>
              }
              isForm={true}
              onSymbolSearch={this.onSymbolSearch}
            />
            <div className={styles.PriceSection}>
              <div className={styles.PriceSectionItem}>
                <div
                  className={priceClassRules(
                    currentSymbolData.c,
                    currentSymbolData
                  )}
                >
                  <div className={styles.FontUp}>
                    {priceFormatted(currentSymbolData.c, currentSymbolData.t) ??
                      '--'}
                  </div>
                  <div>
                    {`${
                      currentSymbolData.ch != null && currentSymbolData.ch > 0
                        ? '+'
                        : ''
                    }${formatNumber(
                      currentSymbolData.ch,
                      2,
                      undefined,
                      undefined,
                      '--'
                    )}(${
                      currentSymbolData.ra != null && currentSymbolData.ra > 0
                        ? '+'
                        : ''
                    }${formatNumber(currentSymbolData.ra, 2)}%)`}
                  </div>
                </div>
              </div>

              <div className={styles.PriceSectionItem}>
                <div>
                  {`${t('Ref')}: `}
                  <span
                    className={priceClassRules(
                      currentSymbolData.re,
                      currentSymbolData
                    )}
                  >
                    {priceFormatted(
                      currentSymbolData.re,
                      currentSymbolData.t
                    ) ?? '--'}
                  </span>
                </div>
                <div>
                  {`${t('High')}: `}
                  <span
                    className={priceClassRules(
                      currentSymbolData.h,
                      currentSymbolData
                    )}
                  >
                    {priceFormatted(currentSymbolData.h, currentSymbolData.t) ??
                      '--'}
                  </span>
                </div>
              </div>

              <div className={styles.PriceSectionItem}>
                <div>
                  {`${t('Ceil')}: `}
                  <span
                    className={priceClassRules(
                      currentSymbolData.ce,
                      currentSymbolData
                    )}
                  >
                    {priceFormatted(
                      currentSymbolData.ce,
                      currentSymbolData.t
                    ) ?? '--'}
                  </span>
                </div>
                <div>
                  {`${t('Low')}: `}
                  <span
                    className={priceClassRules(
                      currentSymbolData.l,
                      currentSymbolData
                    )}
                  >
                    {priceFormatted(currentSymbolData.l, currentSymbolData.t) ??
                      '--'}
                  </span>
                </div>
              </div>

              <div className={styles.PriceSectionItem}>
                <div>
                  {`${t('Floor')}: `}
                  <span
                    className={priceClassRules(
                      currentSymbolData.fl,
                      currentSymbolData
                    )}
                  >
                    {priceFormatted(
                      currentSymbolData.fl,
                      currentSymbolData.t
                    ) ?? '--'}
                  </span>
                </div>
                <div className="marginRatio">{`${t('Margin Ratio')}: ${
                  marginRatio ?? '--'
                }%`}</div>
              </div>

              <div className={styles.PriceSectionItem}>
                <br />
                {`${t('Volume')}: `}
                <span className={styles.Volume}>
                  {formatNumber(
                    currentSymbolData.vo,
                    2,
                    undefined,
                    undefined,
                    '--'
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className={styles.TabsContainer}>
          <div className={styles.MatchingHistoryTabs}>
            <TabTable data={matchingHistoryTabs} />
          </div>
          <div className={styles.OrderTabs}>
            <OrderFunction isTradingTemplate={true} />
          </div>
        </div>
      </BlockUI>
    );
  }

  private onSymbolSearch = (code: string | null) => {
    if (code != null) {
      this.props.setCurrentSymbol({
        code,
        forceUpdate: true,
      });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  currentSymbolData: state.currentSymbolData,
  orderStockInfo: state.orderStockInfo,
});

const mapDispatchToProps = { setCurrentSymbol };

const OrderSection = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(OrderSectionComponent)
  ),
  Fallback,
  handleError
);

export default OrderSection;
