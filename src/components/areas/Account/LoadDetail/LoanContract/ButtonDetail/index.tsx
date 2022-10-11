import * as React from 'react';
import * as style from './style.scss';
import { Fallback } from 'components/common';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';

export interface IButtonDetailProps
  extends React.ClassAttributes<ButtonDetailComponent>,
    WithNamespaces {}

class ButtonDetailComponent extends React.Component<IButtonDetailProps> {
  constructor(props: IButtonDetailProps) {
    super(props);
  }

  render() {
    const { t } = this.props;
    return <div className={style.ButtonDetail}>{t('Detail')}</div>;
  }
}

const ButtonDetail = withErrorBoundary(
  withNamespaces('common')(ButtonDetailComponent),
  Fallback,
  handleError
);

export default ButtonDetail;
