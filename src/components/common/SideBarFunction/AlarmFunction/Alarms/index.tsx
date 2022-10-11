import * as React from 'react';
import * as classNames from 'classnames';
import * as globalStyles from 'styles/style.scss';
import * as styles from './styles.scss';
import { Fallback, ScrollBar } from 'components/common';
import { PauseSVG, PenSVG, TrashSVG } from 'assets/svg';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IAlarmsProps
  extends React.ClassAttributes<AlarmsComponent>,
    WithNamespaces {
  readonly onEditAlarm: () => void;
}

export interface IAlarmsState {
  readonly selectedAlarm?: string;
}

class AlarmsComponent extends React.Component<IAlarmsProps, IAlarmsState> {
  constructor(props: IAlarmsProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t } = this.props;

    return (
      <ScrollBar autoHide={true}>
        <table className={styles.AlarmTable}>
          <colgroup>
            <col span={1} style={{ width: '20%' }} />
            <col span={1} style={{ width: '40%' }} />
            <col span={1} style={{ width: '40%' }} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.SymbolCol}>{t('Symbol')}</th>
              <th>{t('Condition')}</th>
              <th>{t('Frequency')}</th>
            </tr>
          </thead>
          <tbody>
            {TEST_SYMBOL_LIST.map((val, idx) => {
              const onSelectAlarm = () => {
                this.setState({
                  selectedAlarm:
                    this.state.selectedAlarm !== val ? val : undefined,
                });
              };
              return (
                <React.Fragment key={idx}>
                  <tr>
                    <td className={styles.SymbolCol} onClick={onSelectAlarm}>
                      {val}
                    </td>
                    <td onClick={onSelectAlarm}>Price above 33.00</td>
                    <td>
                      <div className={styles.ActionCell}>
                        <span className={styles.AlarmFrequency}>
                          All Future release
                        </span>
                        <span
                          className={classNames(
                            styles.AlarmAction,
                            styles.DisableAction
                          )}
                        >
                          <PauseSVG />
                        </span>
                        <span
                          className={classNames(
                            styles.AlarmAction,
                            styles.EditAction
                          )}
                          onClick={this.props.onEditAlarm}
                        >
                          <PenSVG />
                        </span>
                        <span
                          className={classNames(
                            styles.AlarmAction,
                            styles.DeleteAction
                          )}
                        >
                          <TrashSVG />
                        </span>
                      </div>
                    </td>
                  </tr>
                  {this.state.selectedAlarm === val && (
                    <tr>
                      <td className={styles.AlarmPopup} colSpan={3}>
                        <div className={styles.Arrow} />
                        <div className={styles.AlarmInfo}>
                          <div className={styles.AlarmInfoRow}>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Symbol')}
                            </div>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {val}
                            </div>
                          </div>
                          <div className={styles.AlarmInfoRow}>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Group')}
                            </div>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Event')}
                            </div>
                          </div>
                          <div className={styles.AlarmInfoRow}>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Type')}
                            </div>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Corporate share issuance')}
                            </div>
                          </div>
                          <div className={styles.AlarmInfoRow}>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Condition')}
                            </div>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Immediately')}
                            </div>
                          </div>
                          <div className={styles.AlarmInfoRow}>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Frequency')}
                            </div>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('All future release')}
                            </div>
                          </div>
                          <div className={styles.AlarmInfoRow}>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Delivery by')}
                            </div>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Website pop up')}
                            </div>
                          </div>
                          <div className={styles.AlarmInfoRow}>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Expiration')}
                            </div>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {'03/12/2020'}
                            </div>
                          </div>
                          <div className={styles.AlarmInfoRow}>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Message')}
                            </div>
                            <div
                              className={`${styles.AlarmInfoCell} ${globalStyles.Ellipsis}`}
                            >
                              {t('Content')}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </ScrollBar>
    );
  }
}

const TEST_SYMBOL_LIST = [
  'BID',
  'CTG',
  'EIB',
  'FPT',
  'GAS',
  'HDB',
  'HPG',
  'KDH',
  'MBB',
  'MSN',
  'MWG',
  'NVL',
  'PLX',
  'PNJ',
  'POW',
  'REE',
  'ROS',
  'SAB',
  'SBT',
  'SSI',
  'STB',
  'TCB',
  'TCH',
  'VCB',
  'VHM',
  'VIC',
  'VJC',
  'VNM',
  'VPB',
  'VRE',
];

const Alarms = withErrorBoundary(
  withNamespaces('common')(AlarmsComponent),
  Fallback,
  handleError
);

export default Alarms;
