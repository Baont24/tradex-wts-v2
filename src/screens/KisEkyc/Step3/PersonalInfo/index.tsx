import * as React from 'react';
import * as style from './style.scss';
import { Col, Form } from 'react-bootstrap';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { Lang } from 'constants/enum';
import {
  ListOfSteps,
  contactAddressCheck,
  emailValidator,
  phoneValidator,
} from 'screens/KisEkyc/Common/helper';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { addressData } from 'screens/KisEkyc/Common/addressData';
import { branchEN, branchVN } from 'screens/KisEkyc/Common/branchData';
import { changeEkycParams } from '../../action';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import EkycDropdown from 'screens/KisEkyc/Components/Dropdown';
import EkycInput from 'screens/KisEkyc/Components/Input';

export interface IEkycPersonalInfoProps
  extends React.ClassAttributes<EkycPersonalInfoComponent>,
    WithNamespaces {
  readonly ekycParams: IState['ekycParams'];
  readonly lang: IState['lang'];
  readonly allowToNextStep: (step: string) => void;
  readonly changeEkycParams: typeof changeEkycParams;
}

export interface IEkycPersonalInfoState {
  readonly phoneNo: string;
  readonly gender: string;
  readonly occupation: string;
  readonly permanentProvince: string;
  readonly permanentDistrict: string;
  readonly permanentAddress: string;
  readonly contactProvince: string;
  readonly contactDistrict: string;
  readonly contactAddress: string;
  readonly email: string;
  readonly referrerIdName: string;
  readonly referrerBranch: string;
  readonly branchData: string[];
  readonly cityData: string[];
  readonly districtData: string[];
  readonly genderData: string[];
}

class EkycPersonalInfoComponent extends React.Component<
  IEkycPersonalInfoProps,
  IEkycPersonalInfoState
> {
  constructor(props: IEkycPersonalInfoProps) {
    super(props);
    let permanentCity = '';
    let permanentDistrict = '';
    let permanentAddress = '';
    // get permanent data
    if (props.ekycParams.address) {
      const hometown = (props.ekycParams.address as string).split(',');
      if (hometown.length >= 3) {
        permanentCity = hometown[hometown.length - 1];
        permanentDistrict = hometown[hometown.length - 2];
        permanentAddress = hometown.slice(0, hometown.length - 2).toString();
      }

      if (hometown.length === 2) {
        permanentCity = hometown[1];
        permanentDistrict = hometown[0];
      }
    }

    const genderData = [props.t('Male'), props.t('Female')];
    const cityData = addressData.map((e) => e.city);
    const selectedCity = addressData.find((e) => e.city === cityData[0]);
    let districtData: string[] = [];
    if (selectedCity && selectedCity.quan) {
      districtData = selectedCity.quan.map((val) => val.name);
    }
    const branchData =
      props.lang === Lang.EN ? branchEN.map((e) => e) : branchVN.map((e) => e);

    this.state = {
      phoneNo: this.props.ekycParams.phoneNo || '',
      gender: this.props.ekycParams.gender as string,
      occupation: this.props.ekycParams.occupation || '',
      permanentProvince:
        this.props.ekycParams.permanentProvince || permanentCity,
      permanentDistrict:
        this.props.ekycParams.permanentDistrict || permanentDistrict,
      permanentAddress:
        this.props.ekycParams.permanentAddress || permanentAddress,
      contactProvince: this.props.ekycParams.contactProvince || '',
      contactDistrict: this.props.ekycParams.contactDistrict || '',
      contactAddress: this.props.ekycParams.contactAddress || '',
      email: this.props.ekycParams.email || '',
      referrerIdName: this.props.ekycParams.referrerIdName || '',
      referrerBranch: this.props.ekycParams.referrerBranch || branchData[0],
      branchData,
      cityData,
      districtData,
      genderData,
    };
  }
  componentDidMount() {
    this.props.allowToNextStep(ListOfSteps.PersonalInfo);
  }

  componentDidUpdate(
    prevProps: IEkycPersonalInfoProps,
    prevState: IEkycPersonalInfoState
  ) {
    if (prevState !== this.state) {
      if (
        emailValidator.test(this.state.email.trim()) &&
        phoneValidator.test(this.state.phoneNo.trim()) &&
        contactAddressCheck(this.state.contactAddress) &&
        this.state.gender &&
        this.state.contactAddress &&
        this.state.contactProvince &&
        this.state.contactDistrict &&
        this.state.contactAddress.length +
          this.state.contactProvince.length +
          this.state.contactDistrict.length >
          15
      ) {
        this.props.allowToNextStep(ListOfSteps.PersonalInfoDone);
        this.props.changeEkycParams({
          phoneNo: this.state.phoneNo,
          gender: this.state.gender === this.props.t('Male') ? 'M' : 'F',
          occupation: this.state.occupation,
          permanentProvince: this.state.permanentProvince,
          permanentDistrict: this.state.permanentDistrict,
          permanentAddress: this.state.permanentAddress,
          contactProvince: this.state.contactProvince,
          contactDistrict: this.state.contactDistrict,
          contactAddress: this.state.contactAddress,
          email: this.state.email,
          referrerIdName: this.state.referrerIdName,
          referrerBranch: this.state.referrerBranch,
        });
      } else {
        this.props.allowToNextStep(ListOfSteps.PersonalInfo);
      }
    }
  }

  render() {
    const { t } = this.props;
    const formLeft = (
      <div className={style.FormLeft}>
        <p className={style.Title}>{t('Info')}</p>
        <Form.Row>
          <Col>
            <EkycDropdown
              title="Gender"
              onChange={this.onChangeGender}
              data={this.state.genderData}
              defaultValue={this.props.ekycParams.gender}
              required={true}
            />
          </Col>
          <Col>
            <EkycInput
              title="Occupation"
              defaultValue={this.state.occupation}
              onChange={this.onChangeOccupation}
            />
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <EkycInput
              title="Email"
              defaultValue={this.state.email}
              onChange={this.onChangeEmail}
              validated={emailValidator.test(this.state.email.trim())}
              required={true}
            />
          </Col>
          <Col>
            <EkycInput
              title="Mobile phone"
              defaultValue={this.state.phoneNo}
              onChange={this.onChangePhoneNo}
              validated={phoneValidator.test(this.state.phoneNo.trim())}
              required={true}
            />
          </Col>
        </Form.Row>
        <p className={style.Title}>{t('Permanent Address')}</p>
        <Form.Row>
          <Col>
            <EkycInput
              title="Province/City"
              defaultValue={this.state.permanentProvince}
              disabled={true}
            />
          </Col>
          <Col>
            <EkycInput
              title="District"
              defaultValue={this.state.permanentDistrict}
              disabled={true}
            />
          </Col>
        </Form.Row>
        <EkycInput
          title="Address"
          defaultValue={this.state.permanentAddress}
          disabled={true}
        />
      </div>
    );

    const formRight = (
      <div className={style.FormRight}>
        <p className={style.Title}>{t('Contract Address')}</p>
        <Form.Row>
          <Col>
            <EkycDropdown
              title="Province/City"
              onChange={this.onChangeContactProvince}
              data={this.state.cityData}
              validated={contactAddressCheck(this.state.contactProvince)}
              required={true}
            />
          </Col>
          <Col>
            <EkycDropdown
              title="District"
              onChange={this.onChangeContactDistrict}
              data={this.state.districtData}
              validated={contactAddressCheck(this.state.contactDistrict)}
              required={true}
            />
          </Col>
        </Form.Row>
        <EkycInput
          title="Address"
          defaultValue={this.state.contactAddress}
          onChange={this.onChangeContactAddress}
          validated={contactAddressCheck(this.state.contactAddress)}
          required={true}
        />
        <p className={style.Title}>{t('Referrer Information')}</p>

        <Form.Row>
          <Col>
            <EkycInput
              title="ID Name"
              defaultValue={this.state.referrerIdName}
              onChange={this.onChangeReferrerIdName}
            />
          </Col>
          <Col>
            <EkycDropdown
              title="Branch 1"
              onChange={this.onChangeReferrerBranch}
              data={this.state.branchData}
            />
          </Col>
        </Form.Row>
      </div>
    );

    return (
      <div className={style.EkycPersonalInfo}>
        {formLeft}
        {formRight}
      </div>
    );
  }

  private onChangeGender = (value: string) => {
    this.setState({ gender: value });
  };

  private onChangeOccupation = (value: string) => {
    this.setState({ occupation: value });
  };

  private onChangeEmail = (value: string) => {
    this.setState({ email: value });
  };

  private onChangePhoneNo = (value: string) => {
    this.setState({ phoneNo: value });
  };

  private onChangeContactProvince = (value: string) => {
    const selectedCity = addressData.find((e) => e.city === value);
    let districtData: string[] = [];
    if (selectedCity && selectedCity.quan) {
      districtData = selectedCity.quan.map((val) => val.name);
    }
    this.setState({ contactProvince: value, districtData });
  };

  private onChangeContactDistrict = (value: string) => {
    this.setState({ contactDistrict: value });
  };

  private onChangeContactAddress = (value: string) => {
    this.setState({ contactAddress: value });
  };

  private onChangeReferrerIdName = (value: string) => {
    this.setState({ referrerIdName: value });
  };

  private onChangeReferrerBranch = (value: string) => {
    this.setState({ referrerBranch: value });
  };
}

const mapStateToProps = (state: IState) => ({
  ekycParams: state.ekycParams,
  lang: state.lang,
});

const EkycPersonalInfo = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, { changeEkycParams })(EkycPersonalInfoComponent)
  ),
  Fallback,
  handleError
);

export default EkycPersonalInfo;
