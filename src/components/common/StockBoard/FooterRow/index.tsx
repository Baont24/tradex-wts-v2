import * as React from 'react';
import * as styles from './styles.scss';
import { ICellRendererParams } from 'ag-grid-community';
import { WithNamespaces, withNamespaces } from 'react-i18next';

export interface IFooterRowProps extends ICellRendererParams, WithNamespaces {}

class FooterRowComponent extends React.Component<IFooterRowProps> {
  constructor(props: IFooterRowProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { t } = this.props;
    return (
      <div className={styles.FooterRow}>
        <p>{t(this.props.data.content)}</p>
      </div>
    );
  }
}

const FooterRow = withNamespaces('common')(FooterRowComponent);

export default FooterRow;
