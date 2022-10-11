import * as React from 'react';
import * as styles from './style.scss';
import { Fallback, Spinner } from 'components/common';
import { IState } from 'redux/global-reducers';
import { RouteComponentProps, withRouter } from 'react-router';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { queryClientDetail } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';
import InformationTable from '../InformationTable';

interface IAuthorizedPersonProps
  extends React.ClassAttributes<AuthorizedPersonComponent>,
    WithNamespaces,
    RouteComponentProps {
  readonly selectedAccount: IState['selectedAccount'];
  readonly clientDetail: IState['clientDetail'];
  readonly queryClientDetail: typeof queryClientDetail;
}

class AuthorizedPersonComponent extends React.Component<
  IAuthorizedPersonProps
> {
  constructor(props: IAuthorizedPersonProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (!this.props.clientDetail?.authorizedPerson) {
      this.props.queryClientDetail({
        clientID: this.props.selectedAccount?.username,
      });
    }
  }

  shouldComponentUpdate(nextProps: IAuthorizedPersonProps) {
    return true;
  }

  render() {
    let authorizedPersonInfo = <Spinner size={100} />;
    const authorizedPerson = this.props.clientDetail?.authorizedPerson;

    if (authorizedPerson) {
      const data = [
        {
          title: "Authorized person's name:",
          data: authorizedPerson.authorizedPersonsName,
        },
        {
          title: "Authorized person's ID:",
          data: authorizedPerson.authorizedPersonsID,
        },
        // { title: 'ID Card/Passport:', data: authorizedPerson.IDCardPassport },
        // { title: 'Address:', data: authorizedPerson.address },
        // { title: 'Address:', data: authorizedPerson.address },
        // { title: 'Telephone:', data: authorizedPerson.telephone },
        { title: 'Email:', data: authorizedPerson.email },
      ];
      authorizedPersonInfo = <InformationTable data={data} noBorder={true} />;
    }
    return (
      <div className={styles.AuthorizedPerson}>{authorizedPersonInfo}</div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  selectedAccount: state.selectedAccount,
  clientDetail: state.clientDetail,
});

const mapDispatchToProps = { queryClientDetail };

const AuthorizedPerson = withRouter(
  withErrorBoundary(
    withNamespaces('common')(
      connect(mapStateToProps, mapDispatchToProps)(AuthorizedPersonComponent)
    ),
    Fallback,
    handleError
  )
);

export default AuthorizedPerson;
