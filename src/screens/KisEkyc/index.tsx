import 'react-step-progress/dist/index.css';
import * as React from 'react';
import * as styles from './style.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { Lang } from 'constants/enum';
import { ListOfSteps } from './Common/helper';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Ekyc from 'screens/KisEkyc/EkycSDK';
import Step1 from './Step1';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import StepProgressBar from 'react-step-progress';

export interface IEkycScreenProps
  extends React.ClassAttributes<AppComponent>,
    WithNamespaces {
  readonly forceUsingEnglish?: boolean;
  readonly forceUsingVietnamese?: boolean;

  readonly lang: IState['lang'];
}

export interface IAppState {
  readonly nextStep: string;
  readonly errorMessage: string;
}

class AppComponent extends React.Component<IEkycScreenProps, IAppState> {
  constructor(props: IEkycScreenProps) {
    super(props);
    this.state = {
      nextStep: ListOfSteps.SelectInvestor,
      errorMessage: '',
    };
  }

  render() {
    const { t } = this.props;
    const useEnglish =
      this.props.forceUsingEnglish && this.props.lang === Lang.EN;
    const useVietnamese =
      this.props.forceUsingVietnamese && this.props.lang === Lang.VI;
    const ekyc = (
      <StepProgressBar
        startingStep={0}
        onSubmit={this.onFormSubmit}
        previousBtnName={t('BACK 1')}
        nextBtnName={t('NEXT')}
        primaryBtnClass={styles.NextButton}
        secondaryBtnClass={styles.BackButton}
        buttonWrapperClass={styles.ButtonWrapper}
        steps={[
          {
            label: t('Scan ID Card/ Passport'),
            subtitle: '',
            name: '',
            content: <Step1 allowToNextStep={this.allowToNextStep} />,
            validator: () => this.validateStep(ListOfSteps.InvestorGuide),
          },
          {
            label: t('Face Recognition'),
            subtitle: '',
            name: '',
            content: <Ekyc allowToNextStep={this.allowToNextStep} />,
            validator: () => this.validateStep(ListOfSteps.SDKDone),
          },
          {
            label: t('Personal Information'),
            subtitle: '',
            name: '',
            content: <Step3 allowToNextStep={this.allowToNextStep} />,
            validator: () => this.validateStep(ListOfSteps.PersonalInfoDone),
          },
          {
            label: t('Service Registration'),
            subtitle: '',
            name: '',
            content: <Step4 allowToNextStep={this.allowToNextStep} />,
            validator: () =>
              this.validateStep4(ListOfSteps.UploadSignatureAndImgDone),
          },
          {
            label: t('OTP Authentication'),
            subtitle: '',
            name: '',
            content: <Step5 allowToNextStep={this.allowToNextStep} />,
            validator: () => this.validateStep(''),
          },
        ]}
      />
    );
    return (
      <div className={`${styles.Ekyc} ${this.state.nextStep}`}>
        <div className={styles.LogoSection}>
          <div className={styles.Logo} />
        </div>
        <div className={styles.Crossbar}>
          <div className={styles.CrossbarLeft} />
          <div className={styles.CrossbarRight} />
        </div>
        {useEnglish && ekyc}
        {useVietnamese && ekyc}
        {!this.props.forceUsingEnglish &&
          !this.props.forceUsingVietnamese &&
          ekyc}
        <div className={styles.ErrorMessage}>
          <p>{this.state.errorMessage}</p>
        </div>
      </div>
    );
  }

  private validateStep4 = (step: string) => {
    const { t } = this.props;
    if (step !== this.state.nextStep) {
      if (this.state.nextStep === ListOfSteps.UploadSignatureDone) {
        this.setState({
          errorMessage: t('Please upload a photo of your signature'),
        });
      } else if (this.state.nextStep === ListOfSteps.UploadConfirmImgDone) {
        this.setState({
          errorMessage: t('Please confirm this is your signature'),
        });
      } else if (this.state.nextStep === ListOfSteps.UploadSignature) {
        this.setState({
          errorMessage: t(
            'Please upload your signature photo and confirm your signature'
          ),
        });
      }
    } else {
      this.setState({ errorMessage: '' });
    }
    return step === this.state.nextStep;
  };

  private validateStep = (step: string) => {
    return step === this.state.nextStep;
  };

  private allowToNextStep = (step: string) => {
    this.setState({ nextStep: step });
  };

  private onFormSubmit = () => {};
}

const mapStateToProps = (state: IState) => ({
  lang: state.lang,
});

const EkycScreen = withErrorBoundary(
  withNamespaces('common')(connect(mapStateToProps, {})(AppComponent)),
  Fallback,
  handleError
);

export default EkycScreen;
