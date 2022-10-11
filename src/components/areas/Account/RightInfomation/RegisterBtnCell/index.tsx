import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

interface IResgisterCellProps
  extends React.ClassAttributes<ResgisterBtnCellComponent>,
    WithNamespaces {}

class ResgisterBtnCellComponent extends React.Component<IResgisterCellProps> {
  constructor(props: IResgisterCellProps) {
    super(props);
  }

  render() {
    const { t } = this.props;
    return (
      <div className={styles.ResgisterBtnCell}>
        <button> {t('Register')}</button>
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({});

const mapDispatchToProps = {};

const ResgisterBtnCell = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(ResgisterBtnCellComponent)
  ),
  Fallback,
  handleError
);

export default ResgisterBtnCell;
