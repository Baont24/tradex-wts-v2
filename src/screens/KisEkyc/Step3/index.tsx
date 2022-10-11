import * as React from 'react';
import * as style from './style.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { Investor } from 'interfaces/ekyc';
import { ListOfSteps } from '../Common/helper';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import EkycCheckingInfo from './CheckingInfo';
import EkycForeignInvestor from './ForeignInvestor';
import EkycPersonalInfo from './PersonalInfo';

export interface IStep3Props
  extends React.ClassAttributes<Step3Component>,
    WithNamespaces {
  readonly allowToNextStep: (step: string) => void;
  readonly ekycDocumentType: IState['ekycDocumentType'];
}

export interface IStep3State {
  readonly isCheckingInfo: boolean;
  readonly isUploadingTradingCode: boolean;
}

class Step3Component extends React.Component<IStep3Props, IStep3State> {
  constructor(props: IStep3Props) {
    super(props);
    this.state = {
      isCheckingInfo: true,
      isUploadingTradingCode: props.ekycDocumentType === Investor.FR,
    };
  }

  componentDidMount() {
    this.props.allowToNextStep(ListOfSteps.CheckInfo);
  }

  render() {
    const { t } = this.props;
    const foreignInvestor = this.props.ekycDocumentType === Investor.FR;
    return (
      <div className={style.Step3}>
        <p className={style.PersonalInfoTitle}>
          {t(
            this.state.isUploadingTradingCode
              ? 'You are a foreign investor'
              : 'Personal Information'
          )}
        </p>
        {foreignInvestor && this.state.isUploadingTradingCode ? (
          <EkycForeignInvestor
            finishCheckingInfo={this.finishUploadingTradingCode}
          />
        ) : null}
        {!this.state.isUploadingTradingCode ? (
          this.state.isCheckingInfo ? (
            <EkycCheckingInfo finishCheckingInfo={this.finishCheckingInfo} />
          ) : (
            <EkycPersonalInfo allowToNextStep={this.props.allowToNextStep} />
          )
        ) : null}
      </div>
    );
  }

  private finishCheckingInfo = () => {
    this.setState({ isCheckingInfo: false });
  };
  private finishUploadingTradingCode = () => {
    this.setState({ isUploadingTradingCode: false });
  };
}

const mapStateToProps = (state: IState) => ({
  ekycDocumentType: state.ekycDocumentType,
});

const Step3 = withErrorBoundary(
  withNamespaces('common')(connect(mapStateToProps)(Step3Component)),
  Fallback,
  handleError
);

export default Step3;
