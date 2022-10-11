import * as React from 'react';
import * as style from './style.scss';
import { Fallback } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface ICommonErrorProps
  extends React.ClassAttributes<CommonErrorComponent>,
    WithNamespaces {
  readonly error: boolean;
  readonly errorMessage: string;
}

class CommonErrorComponent extends React.Component<ICommonErrorProps> {
  constructor(props: ICommonErrorProps) {
    super(props);
  }

  render() {
    return this.props.error ? (
      <p className={style.CommonError + ' text-warning'}>
        {this.props.errorMessage}
      </p>
    ) : null;
  }
}

const CommonError = withErrorBoundary(
  withNamespaces('common')(CommonErrorComponent),
  Fallback,
  handleError
);

export default CommonError;
