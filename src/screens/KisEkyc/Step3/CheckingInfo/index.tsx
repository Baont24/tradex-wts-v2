import * as React from 'react';
import * as style from './style.scss';
import { Col } from 'react-bootstrap';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { Investor } from 'interfaces/ekyc';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import {
  changeEkycParams,
  resetUploadImageStatus,
  uploadImg,
} from '../../action';
import { connect } from 'react-redux';
import {
  dateFormatCheck,
  getDocumentType,
} from 'screens/KisEkyc/Common/helper';
import { formatDateToString, formatStringToDate } from 'utils/datetime';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import Button from 'react-bootstrap/Button';
import EkycInput from 'screens/KisEkyc/Components/Input';
import EkycLoading from 'screens/KisEkyc/Components/Loading';
import Form from 'react-bootstrap/Form';

export interface IEkycCheckingInfoProps
  extends React.ClassAttributes<EkycCheckingInfoComponent>,
    WithNamespaces {
  readonly ekycSdkData: IState['ekycSdkData'];
  readonly ekycParams: IState['ekycParams'];
  readonly ekycUploadImageFailed: IState['ekycUploadImageFailed'];
  readonly ekycDocumentType: IState['ekycDocumentType'];
  readonly finishCheckingInfo: () => void;
  readonly changeEkycParams: typeof changeEkycParams;
  readonly uploadImg: typeof uploadImg;
  readonly resetUploadImageStatus: typeof resetUploadImageStatus;
}

export interface IEkycCheckingInfoState {
  readonly identifierId: string;
  readonly fullName: string;
  readonly birthDay: string;
  readonly issueDate: string;
  readonly issuePlace: string;
  readonly hometown: string;
  readonly address: string;
  readonly showLoading: boolean;
}

class EkycCheckingInfoComponent extends React.Component<
  IEkycCheckingInfoProps,
  IEkycCheckingInfoState
> {
  constructor(props: IEkycCheckingInfoProps) {
    super(props);
    this.state = {
      identifierId: props.ekycSdkData ? props.ekycSdkData.id : '',
      fullName: props.ekycSdkData ? props.ekycSdkData.name : '',
      birthDay: props.ekycSdkData ? props.ekycSdkData.birth_day : '',
      issueDate: props.ekycSdkData ? props.ekycSdkData.issue_date : '',
      issuePlace: props.ekycSdkData
        ? props.ekycSdkData.issue_place.replace(/(\r\n|\n|\r)/gm, ' ')
        : '',
      hometown: props.ekycSdkData ? props.ekycSdkData.origin_location : '',
      address: props.ekycSdkData
        ? props.ekycSdkData.recent_location.replace(/(\r\n|\n|\r)/gm, ',')
        : '',
      showLoading: false,
    };
  }

  componentDidUpdate() {
    if (
      (this.props.ekycDocumentType === Investor.FR ||
        this.props.ekycParams.backImageUrl) &&
      this.props.ekycParams.frontImageUrl &&
      this.props.ekycParams.portraitImageUrl
    ) {
      this.props.finishCheckingInfo();
    }
  }

  render() {
    const { ekycSdkData, t } = this.props;
    return (
      <div className={style.EkycCheckingInfo}>
        {this.state.showLoading ? (
          <EkycLoading
            title={'Đang tải ảnh lên hệ thống. Vui lòng chờ trong giây lát'}
            failed={this.props.ekycUploadImageFailed}
            tryAgain={this.uploadImage}
          />
        ) : (
          ekycSdkData && (
            <Form onSubmit={this.onSubmit}>
              <Form.Row>
                <Col>
                  <EkycInput
                    title="ID Card"
                    defaultValue={this.state.identifierId}
                    onChange={this.onChangeID}
                    required={true}
                    disabled={true}
                    showError={true}
                    validated={true}
                  />
                </Col>
                <Col>
                  <EkycInput
                    title="Full name"
                    defaultValue={this.state.fullName}
                    onChange={this.onChangeFullName}
                    required={true}
                    showError={true}
                  />
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <EkycInput
                    title="Date of Birth"
                    defaultValue={this.state.birthDay}
                    onChange={this.onChangeBirthDay}
                    required={true}
                    showError={true}
                    validated={dateFormatCheck.test(this.state.birthDay.trim())}
                  />
                </Col>
                <Col>
                  <EkycInput
                    title="Date of Issued"
                    defaultValue={this.state.issueDate}
                    onChange={this.onChangeIssueDate}
                    required={true}
                    showError={true}
                    validated={dateFormatCheck.test(
                      this.state.issueDate.trim()
                    )}
                  />
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <EkycInput
                    title="Place of Issued"
                    defaultValue={this.state.issuePlace}
                    onChange={this.onChangeIssuePlace}
                    required={true}
                    showError={true}
                  />
                </Col>
                <Col>
                  <EkycInput
                    title="Home Town"
                    defaultValue={this.state.hometown}
                    onChange={this.onChangeHometown}
                    required={true}
                    showError={true}
                  />
                </Col>
              </Form.Row>
              <EkycInput
                title="Address"
                defaultValue={this.state.address}
                onChange={this.onChangeAddress}
                showError={true}
                required={true}
              />
              <div className={style.btnContainer}>
                <Button variant="primary" type="submit">
                  {t('NEXT')}
                </Button>
              </div>
            </Form>
          )
        )}
      </div>
    );
  }

  private onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (
      form.checkValidity() &&
      dateFormatCheck.test(this.state.issueDate.trim()) &&
      dateFormatCheck.test(this.state.birthDay.trim()) &&
      this.props.ekycSdkData
    ) {
      const params = {
        identifierId: this.state.identifierId,
        fullName: this.state.fullName,
        birthDay:
          formatDateToString(
            formatStringToDate(this.state.birthDay.trim(), 'dd/MM/yyyy'),
            'yyyyMMdd'
          ) || '',
        issueDate:
          formatDateToString(
            formatStringToDate(this.state.issueDate.trim(), 'dd/MM/yyyy'),
            'yyyyMMdd'
          ) || '',
        issuePlace: this.state.issuePlace,
        address: this.state.address,
        type: getDocumentType(this.props.ekycSdkData.card_type as string), // CMND, CC, PASSPORT
        gender: this.props.ekycSdkData.gender,
      };
      this.props.changeEkycParams(params);

      this.uploadImage();
    }
  };

  private uploadImage = () => {
    if (this.props.ekycSdkData) {
      this.props.resetUploadImageStatus();
      this.props.uploadImg({
        key: `ekyc_front_image_${this.state.identifierId}`,
        uri: this.props.ekycSdkData.imgBase64.img_front,
      });
      if (this.props.ekycDocumentType !== Investor.FR) {
        this.props.uploadImg({
          key: `ekyc_back_image_${this.state.identifierId}`,
          uri: this.props.ekycSdkData.imgBase64.img_back,
        });
      }
      this.props.uploadImg({
        key: `ekyc_portrait_image_${this.state.identifierId}`,
        uri: this.props.ekycSdkData.imgBase64.img_face,
      });
      this.setState({ showLoading: true });
    }
  };

  private onChangeID = (val: string) => {
    this.setState({ identifierId: val });
  };

  private onChangeFullName = (val: string) => {
    this.setState({ fullName: val });
  };

  private onChangeBirthDay = (val: string) => {
    this.setState({ birthDay: val });
  };

  private onChangeIssueDate = (val: string) => {
    this.setState({ issueDate: val });
  };

  private onChangeIssuePlace = (val: string) => {
    this.setState({ issuePlace: val });
  };

  private onChangeHometown = (val: string) => {
    this.setState({ hometown: val });
  };

  private onChangeAddress = (val: string) => {
    this.setState({ address: val });
  };
}

const mapStateToProps = (state: IState) => ({
  ekycSdkData: state.ekycSdkData,
  ekycParams: state.ekycParams,
  ekycUploadImageFailed: state.ekycUploadImageFailed,
  ekycDocumentType: state.ekycDocumentType,
});

const EkycCheckingInfo = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, {
      changeEkycParams,
      uploadImg,
      resetUploadImageStatus,
    })(EkycCheckingInfoComponent)
  ),
  Fallback,
  handleError
);

export default EkycCheckingInfo;
