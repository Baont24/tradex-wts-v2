import * as React from 'react';
import * as styles from './styles.scss';
import { FaCaretDown, FaCaretRight } from 'react-icons/fa';
import { ICellRendererParams } from 'ag-grid-community';
import { IEquityEnquiryPortfolioPerSubAccResponse } from 'interfaces/api';

interface IAccountCellProps extends ICellRendererParams {
  readonly value: string;
  readonly data: IEquityEnquiryPortfolioPerSubAccResponse;
  readonly selectedAccount?: string;
}

export default class AccountCell extends React.Component<IAccountCellProps> {
  constructor(props: IAccountCellProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { data, value, selectedAccount } = this.props;

    return (
      <div className={styles.AccountCell}>
        {value === 'TOTAL' ? (
          <span className="m-auto">{value}</span>
        ) : (
          <>
            <span>{value}</span>
            {data.portfolioList != null && (
              <span>
                {value === selectedAccount ? <FaCaretDown /> : <FaCaretRight />}
              </span>
            )}
          </>
        )}
      </div>
    );
  }
}
