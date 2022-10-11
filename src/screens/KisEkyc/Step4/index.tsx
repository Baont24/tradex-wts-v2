import * as React from 'react';
import * as style from './style.scss';
import { Button, Col, Form } from 'react-bootstrap';
import { CheckBox, Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { ListOfSteps } from '../Common/helper';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeEkycParams, resetUploadImageStatus, uploadImg } from '../action';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { queryBankListInfo } from 'components/areas/Account/CashTransfer/CashTransferToBank/action';
import { withErrorBoundary } from 'react-error-boundary';
import EkycDropdown from '../Components/Dropdown';
import EkycInput from '../Components/Input';
import EkycLoading from '../Components/Loading';
import uuid from 'uuid-random';

export interface IStep4Props
  extends React.ClassAttributes<Step4Component>,
    WithNamespaces {
  readonly ekycParams: IState['ekycParams'];
  readonly lang: IState['lang'];
  readonly ekycUploadImageFailed: IState['ekycUploadImageFailed'];
  readonly globalBankInfo: IState['bankInfo'];
  readonly allowToNextStep: (step: string) => void;
  readonly changeEkycParams: typeof changeEkycParams;
  readonly uploadImg: typeof uploadImg;
  readonly resetUploadImageStatus: typeof resetUploadImageStatus;
  readonly queryBankListInfo: typeof queryBankListInfo;
}

export interface IStep4State {
  readonly imgUrl: string;
  readonly bankAccount: string;
  readonly accountName: string;
  readonly bankName: string;
  readonly branch: string;
  readonly isUploadingFile: boolean;
  readonly bankData: string[];
  readonly branchData: string[];
  readonly agreeWithKis: boolean;
  readonly confirmSignature: boolean;
  readonly showLoading: boolean;
}

class Step4Component extends React.Component<IStep4Props, IStep4State> {
  constructor(props: IStep4Props) {
    super(props);
    const bankList = props.globalBankInfo.map((item) => item.name);

    this.state = {
      imgUrl: '',
      bankAccount: '',
      accountName: '',
      bankName: '',
      branch: '',
      isUploadingFile: false,
      bankData: bankList,
      branchData: [],
      agreeWithKis: true,
      confirmSignature: false,
      showLoading: false,
    };
  }
  componentDidMount() {
    this.props.allowToNextStep(ListOfSteps.ServiceInfo);
    if (this.props.globalBankInfo.length === 0) {
      this.props.queryBankListInfo();
    }
  }

  componentDidUpdate(prevProps: IStep4Props, prevState: IStep4State) {
    if (
      this.state.confirmSignature !== prevState.confirmSignature ||
      prevProps.ekycParams.signatureImageUrl !==
        this.props.ekycParams.signatureImageUrl
    ) {
      if (
        this.state.confirmSignature &&
        this.props.ekycParams.signatureImageUrl
      ) {
        this.props.allowToNextStep(ListOfSteps.UploadSignatureAndImgDone);
      } else if (this.state.confirmSignature) {
        this.props.allowToNextStep(ListOfSteps.UploadSignatureDone);
      } else if (this.props.ekycParams.signatureImageUrl) {
        this.setState({ showLoading: false });
        this.props.allowToNextStep(ListOfSteps.UploadConfirmImgDone);
      } else if (
        !this.state.confirmSignature &&
        !this.props.ekycParams.signatureImageUrl
      ) {
        this.props.allowToNextStep(ListOfSteps.UploadSignature);
      }
    }

    if (prevProps.globalBankInfo !== this.props.globalBankInfo) {
      const bankData = this.props.globalBankInfo.map((item) => item.name);
      const bankName = this.props.globalBankInfo.map((item) => item.name)[0];
      let branchData: string[] = [];
      this.props.globalBankInfo.forEach((val) => {
        if (bankName === val.name) {
          branchData = [...val.branch.map((item) => item.branchName)];
        }
      });
      this.setState({ bankData, branchData });
    }
  }

  render() {
    const { t } = this.props;
    const serviceInfo = (
      <>
        <p className={style.Title}>{t('Service')}</p>
        <div className={style.ServiceInfo}>
          <p className={style.Subtitle}>{t('Opening Account')}</p>
          <CheckBox label={t('Equity Account')} checked />
          <p className={style.Subtitle}>{t('Transfer Online')}</p>
          <Form onSubmit={this.onSubmit}>
            <Form.Row>
              <Col>
                <EkycInput
                  title="Bank Account"
                  defaultValue={this.state.bankAccount}
                  onChange={this.onChangeBankAccount}
                />
              </Col>
              <Col>
                <EkycInput
                  title="Account Name 1"
                  defaultValue={this.state.accountName}
                  onChange={this.onChangeAccountName}
                />
              </Col>
            </Form.Row>
            <Form.Row>
              <Col>
                <EkycDropdown
                  title="Bank Name"
                  onChange={this.onChangeBank}
                  data={this.state.bankData}
                />
              </Col>
              <Col>
                <EkycDropdown
                  title="Branch"
                  onChange={this.onChangeBranch}
                  data={this.state.branchData}
                />
              </Col>
            </Form.Row>
            <div className={style.CheckboxContainer}>
              <CheckBox
                checked={this.state.agreeWithKis}
                onChange={this.onChangeAgree}
              />
              <p>
                {t('I_AGREE_FULLNAME_WITH_KIS', {
                  fullname: this.props.ekycParams.fullName,
                })}
                <a
                  href={
                    this.props.lang === 'vi'
                      ? 'https://kisvn.vn/wp-content/uploads/2020/10/KIS_H%E1%BB%A2P-%C4%90%E1%BB%92NG-MTK-TI%E1%BA%BENG-VI%E1%BB%86T_06.2020.pdf'
                      : 'https://kisvn.vn/en/wp-content/uploads/sites/2/2020/08/H%C4%90-MTK-TIENG-ANH-LOGO-10-NAM.pdf'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('terms and conditions')}
                </a>
                <span> {t('of opening account and service registration')}</span>
              </p>
            </div>

            <div className={style.btnContainer}>
              <Button variant="primary" type="submit">
                {t('NEXT')}
              </Button>
            </div>
          </Form>
        </div>
      </>
    );
    const uploadFile = (
      <>
        <p className={style.Title}>{t('Upload Signature')}</p>
        <p>
          {t('Please, upload your signature to experience the services of KIS')}
        </p>
        <div
          className={style.FileUpload}
          style={{
            backgroundImage: `url(${this.state.imgUrl})`,
          }}
        >
          {this.state.showLoading ? (
            <EkycLoading
              title={'Đang tải ảnh lên hệ thống. Vui lòng chờ trong giây lát'}
              failed={this.props.ekycUploadImageFailed}
              tryAgain={this.uploadImage}
            />
          ) : (
            <div>
              {' '}
              <div className={style.InputContainer}>
                <input
                  type="file"
                  className={style.CustomFileInput}
                  onChange={this.onUploadFile}
                  accept="image/png, image/gif, image/jpeg"
                />
              </div>
              <p className={style.Note}>{t('Upload your signature')}</p>
              <p className={style.WarningNote}>
                ({t('Signature and fullname')})
              </p>
            </div>
          )}
        </div>
        <CheckBox
          label={t('I confirmed this is my signature')}
          checked={this.state.confirmSignature}
          onChange={this.onChangeConfirm}
        />
      </>
    );

    return (
      <div className={style.Step4}>
        {this.state.isUploadingFile ? uploadFile : serviceInfo}
      </div>
    );
  }
  private onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() && this.state.agreeWithKis) {
      const params = {
        bankAccount: this.state.bankAccount,
        accountName: this.state.accountName,
        bankName: this.state.bankName,
        branch: this.state.branch,
      };
      this.props.changeEkycParams(params);
      this.props.allowToNextStep(ListOfSteps.UploadSignature);
      this.setState({ isUploadingFile: true });
    }
  };

  private onUploadFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const url = URL.createObjectURL(files[0]);
      this.setState({ imgUrl: url, showLoading: true }, () => {
        this.uploadImage();
      });
    }
  };

  private uploadImage = () => {
    const keyRandom = uuid();
    this.props.resetUploadImageStatus();
    this.props.uploadImg({
      key: `ekyc_signature_image_${keyRandom}_${this.props.ekycParams.identifierId}`,
      uri: this.state.imgUrl,
    });
  };

  private onChangeAgree = (val: boolean) => {
    this.setState({ agreeWithKis: val });
  };

  private onChangeConfirm = (val: boolean) => {
    this.setState({ confirmSignature: val });
  };

  private onChangeBankAccount = (val: string) => {
    this.setState({ bankAccount: val });
  };

  private onChangeAccountName = (val: string) => {
    this.setState({ accountName: val });
  };

  private onChangeBank = (bankName: string) => {
    let branchData: string[] = [];
    this.props.globalBankInfo.forEach((val) => {
      if (bankName === val.name) {
        branchData = [...val.branch.map((item) => item.branchName)];
      }
    });
    this.setState({ branchData, branch: branchData[0], bankName });
  };

  private onChangeBranch = (val: string) => {
    this.setState({ branch: val });
  };
}

const mapStateToProps = (state: IState) => ({
  ekycParams: state.ekycParams,
  lang: state.lang,
  ekycUploadImageFailed: state.ekycUploadImageFailed,
  globalBankInfo: state.bankInfo,
});

const Step4 = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, {
      changeEkycParams,
      uploadImg,
      resetUploadImageStatus,
      queryBankListInfo,
    })(Step4Component)
  ),
  Fallback,
  handleError
);

export default Step4;
