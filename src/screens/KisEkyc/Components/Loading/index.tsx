import * as React from 'react';
import * as style from './style.scss';
import { Button } from 'react-bootstrap';
import { Fallback } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IEkycLoadingProps
  extends React.ClassAttributes<EkycLoadingComponent>,
    WithNamespaces {
  readonly title: string;
  readonly failed: boolean;
  readonly tryAgain: () => void;
}

export interface IEkycLoadingState {}

class EkycLoadingComponent extends React.Component<
  IEkycLoadingProps,
  IEkycLoadingState
> {
  constructor(props: IEkycLoadingProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { t } = this.props;
    return (
      <div>
        <div className={style.SVGContainer}>
          <div className="lds-dual-ring" />
          <p>{this.props.failed ? 'Failed' : t(this.props.title)}</p>
          {this.props.failed && (
            <Button onClick={this.props.tryAgain}>{t('Try again')}</Button>
          )}
        </div>
      </div>
    );
  }
}

const EkycLoading = withErrorBoundary(
  withNamespaces('common')(EkycLoadingComponent),
  Fallback,
  handleError
);

export default EkycLoading;
