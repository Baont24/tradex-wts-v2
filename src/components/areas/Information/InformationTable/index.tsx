import * as React from 'react';
import * as styles from './style.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import classNames from 'classnames';

interface IInformationTableProps
  extends React.ClassAttributes<InformationTableComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly data: Array<{ readonly title: string; readonly data: string }>;
  readonly noBorder?: boolean;
}

class InformationTableComponent extends React.Component<
  IInformationTableProps
> {
  constructor(props: IInformationTableProps) {
    super(props);

    this.state = {};
  }

  shouldComponentUpdate(nextProps: IInformationTableProps) {
    return true;
  }

  render() {
    const { t } = this.props;
    return (
      <>
        <div
          className={classNames(styles.InformationTable, {
            [styles.NoBorder]: this.props.noBorder,
          })}
        >
          {this.props.data.map((info) => (
            <div className={styles.InformationTableRow} key={info.title}>
              <p className={styles.InformationTableRowTitle}>{t(info.title)}</p>
              <p>{info.data}</p>
            </div>
          ))}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
});

const mapDispatchToProps = {};

const InformationTable = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(InformationTableComponent)
    ),
    Fallback,
    handleError
  )
);

export default InformationTable;
