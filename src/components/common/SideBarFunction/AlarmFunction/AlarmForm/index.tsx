import * as React from 'react';
import { Fallback } from 'components/common';
import { FormAction } from 'constants/enum';
import { Formik } from 'formik';
import { IAlarmForm } from 'interfaces/market';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Form from './form';

const initialValues: IAlarmForm = {
  symbol: 'AAA',
};

export interface IAlarmFormProps
  extends React.ClassAttributes<AlarmFormComponent>,
    WithNamespaces {
  readonly action?: FormAction;
}

class AlarmFormComponent extends React.Component<IAlarmFormProps> {
  constructor(props: IAlarmFormProps) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Formik initialValues={initialValues} onSubmit={this.onSubmit}>
        {(props) => <Form action={this.props.action} {...props} />}
      </Formik>
    );
  }

  private onSubmit = (values: IAlarmForm) => {
    console.log('value', values);
  };
}

const AlarmForm = withErrorBoundary(
  withNamespaces('common')(AlarmFormComponent),
  Fallback,
  handleError
);

export default AlarmForm;
