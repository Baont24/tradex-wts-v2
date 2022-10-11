import * as React from 'react';
import * as styles from './style.scss';
import { FaUser } from 'react-icons/fa';
import { Fallback, Spinner } from 'components/common';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { queryClientDetail } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import InformationTable from '../InformationTable';

interface ICustomerProfileProps
  extends React.ClassAttributes<CustomerProfileComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly clientDetail: IState['clientDetail'];
  readonly queryClientDetail: typeof queryClientDetail;
}

class CustomerProfileComponent extends React.Component<ICustomerProfileProps> {
  constructor(props: ICustomerProfileProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (!this.props.clientDetail?.customerProfile) {
      this.props.queryClientDetail({
        clientID: this.props.selectedAccount?.username,
      });
    }
  }

  shouldComponentUpdate(nextProps: ICustomerProfileProps) {
    return true;
  }

  render() {
    const customerProfile = this.props.clientDetail.customerProfile;
    let infoData = <Spinner size={100} />;
    if (customerProfile) {
      const tableData1 = [
        { title: 'Account No.', data: customerProfile.accountNo },
        { title: 'Customer ID', data: customerProfile.customerID },
        { title: 'Username 2', data: customerProfile.userName },
        { title: 'ID Number/Passport', data: customerProfile.IDNumberPassport },
        { title: 'Address', data: customerProfile.address },
        { title: 'Telephone', data: customerProfile.telephone },
        { title: 'Mobile phone', data: customerProfile.mobilePhone },
      ];
      const tableData2 = [
        { title: 'Email', data: customerProfile.email },
        // { title: 'Customer Type', data: customerProfile.customerType },
        // { title: 'Branch Name', data: customerProfile.branchName },
        // { title: "Broker's Name", data: customerProfile.brokersName },
        // { title: "Broker's Contact No.", data: customerProfile.brokersContactNo },
        // { title: "Broker's Email'", data: customerProfile.brokersEmail },
        {
          title: 'Authorized Person 1',
          data: customerProfile.authorizedPerson ? 'Yes' : 'No',
        },
      ];
      infoData = (
        <>
          <div className={styles.CustomerProfileDetails}>
            <div className={styles.CustomerProfileMoreDetails}>
              <FaUser size={80} />
              <p className={styles.CustomerProfileName}>
                {this.props.selectedAccount?.accountName}
              </p>
            </div>
          </div>
          <InformationTable data={tableData1} />
          <InformationTable data={tableData2} />
        </>
      );
    }

    return <div className={styles.CustomerProfile}>{infoData}</div>;
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  clientDetail: state.clientDetail,
});

const mapDispatchToProps = { queryClientDetail };

const CustomerProfile = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(CustomerProfileComponent)
    ),
    Fallback,
    handleError
  )
);

export default CustomerProfile;
