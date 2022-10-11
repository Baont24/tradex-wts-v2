import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Fallback, ScrollBar } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IAlarmHistoryProps
  extends React.ClassAttributes<AlarmHistoryComponent>,
    WithNamespaces {}

export interface IAlarmHistoryState {
  readonly selectedAlertHistory?: string;
}

class AlarmHistoryComponent extends React.Component<
  IAlarmHistoryProps,
  IAlarmHistoryState
> {
  constructor(props: IAlarmHistoryProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t } = this.props;

    return (
      <ScrollBar>
        <table className={styles.AlarmHistoryTable}>
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
            {['AAA', 'ACB', 'BID'].map((val, idx) => {
              const onSelectRow = () => {
                if (this.state.selectedAlertHistory !== val) {
                  this.setState({ selectedAlertHistory: val });
                } else {
                  this.setState({ selectedAlertHistory: undefined });
                }
              };

              return (
                <tr
                  key={idx}
                  className={classNames({
                    [styles.SelectedRow]:
                      this.state.selectedAlertHistory === val,
                  })}
                  onClick={onSelectRow}
                >
                  <td className={styles.SymbolCol}>{val}</td>
                  <td>Price above 33.00</td>
                  <td>09/10 | 09:32:23</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollBar>
    );
  }
}

const AlarmHistory = withErrorBoundary(
  withNamespaces('common')(AlarmHistoryComponent),
  Fallback,
  handleError
);

export default AlarmHistory;
