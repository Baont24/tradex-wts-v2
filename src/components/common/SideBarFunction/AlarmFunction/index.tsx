import * as React from 'react';
import * as styles from './styles.scss';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { Fallback, TabTable } from 'components/common';
import { FormAction } from 'constants/enum';
import { ITabTableData } from 'interfaces/common';
import { TrashSVG } from 'assets/svg';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import AlarmForm from './AlarmForm';
import AlarmHistory from './AlarmHistory';
import Alarms from './Alarms';

export interface IAlarmFunctionProps
  extends React.ClassAttributes<AlarmFunctionComponent>,
    WithNamespaces {}

export interface IAlarmFunctionState {
  readonly isAlarmFormOpened?: boolean;
  readonly alarmFormAction?: FormAction;
}

class AlarmFunctionComponent extends React.Component<
  IAlarmFunctionProps,
  IAlarmFunctionState
> {
  constructor(props: IAlarmFunctionProps) {
    super(props);

    this.state = {};
  }

  render() {
    const alarmsTab: ITabTableData[] = [
      {
        key: 'alerts',
        title: this.props.t('Alerts'),
        default: true,
        component: this.state.isAlarmFormOpened ? (
          <AlarmForm action={this.state.alarmFormAction} />
        ) : (
          <Alarms onEditAlarm={this.onEditAlarm} />
        ),
      },
    ];

    const alarmHistoryTab: ITabTableData[] = [
      {
        key: 'alert-history',
        title: this.props.t('Alert History'),
        default: true,
        component: <AlarmHistory />,
      },
    ];

    return (
      <div className={styles.AlarmFunction}>
        <div className={styles.Alarms}>
          <TabTable
            cornerLogo={this.state.isAlarmFormOpened ? <FaTimes /> : <FaPlus />}
            data={alarmsTab}
            onCornerLogoClick={this.onCreateAlarm}
          />
        </div>
        <div className={styles.AlarmsHistory}>
          <TabTable
            cornerLogo={<TrashSVG width={11} />}
            data={alarmHistoryTab}
            onCornerLogoClick={this.onClearAlarmHistory}
          />
        </div>
      </div>
    );
  }

  private onCreateAlarm = () => {
    this.setState({
      isAlarmFormOpened: !this.state.isAlarmFormOpened,
      alarmFormAction: !this.state.isAlarmFormOpened
        ? FormAction.CREATE
        : undefined,
    });
  };

  private onEditAlarm = () => {
    this.setState({
      isAlarmFormOpened: !this.state.isAlarmFormOpened,
      alarmFormAction: !this.state.isAlarmFormOpened
        ? FormAction.EDIT
        : undefined,
    });
  };

  private onClearAlarmHistory = () => {
    console.log('clear alarm');
  };
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

const AlarmFunction = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(AlarmFunctionComponent)
  ),
  Fallback,
  handleError
);

export default AlarmFunction;
