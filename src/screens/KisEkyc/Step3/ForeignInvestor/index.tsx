import * as React from 'react';
import * as style from './style.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { resetUploadImageStatus, uploadImg } from '../../action';
import { withErrorBoundary } from 'react-error-boundary';
import EkycLoading from 'screens/KisEkyc/Components/Loading';

export interface IEkycForeignInvestorProps
  extends React.ClassAttributes<EkycForeignInvestorComponent>,
    WithNamespaces {
  readonly ekycSdkData: IState['ekycSdkData'];
  readonly ekycParams: IState['ekycParams'];
  readonly ekycUploadImageFailed: IState['ekycUploadImageFailed'];
  readonly uploadImg: typeof uploadImg;
  readonly resetUploadImageStatus: typeof resetUploadImageStatus;
  readonly finishCheckingInfo: () => void;
}

export interface IEkycForeignInvestorState {
  readonly showLoading: boolean;
}

class EkycForeignInvestorComponent extends React.Component<
  IEkycForeignInvestorProps,
  IEkycForeignInvestorState
> {
  private localTradingCodeImageUrl: string;
  constructor(props: IEkycForeignInvestorProps) {
    super(props);
    this.state = {
      showLoading: false,
    };
  }

  componentDidUpdate() {
    if (this.props.ekycParams.tradingCodeImageUrl) {
      this.props.finishCheckingInfo();
    }
  }
  render() {
    const { t } = this.props;
    return (
      <>
        {this.state.showLoading ? (
          <EkycLoading
            title={'Đang tải ảnh lên hệ thống. Vui lòng chờ trong giây lát'}
            failed={this.props.ekycUploadImageFailed}
            tryAgain={this.uploadImage}
          />
        ) : (
          <div className={style.EkycForeignInvestor}>
            <div className={style.ForeignText}>
              <p>
                {t(
                  'If you have trading code, please take a photo Trading Code'
                )}
              </p>
              <p>
                {t(
                  "If you don't have trading code, Please go to the branches of KIS company to register for Trading Code"
                )}
              </p>
            </div>
            <div className={style.PhotoPicker}>
              <div className={style.InputContainer}>
                <input
                  type="file"
                  className={style.CustomFileInput}
                  onChange={this.onUploadFile}
                  accept="image/png, image/gif, image/jpeg"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  private onUploadFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (files && files[0] && this.props.ekycSdkData) {
      const url = URL.createObjectURL(files[0]);
      this.localTradingCodeImageUrl = url;
      this.uploadImage();
    }
  };

  private uploadImage = () => {
    this.props.resetUploadImageStatus();
    if (this.props.ekycSdkData) {
      this.props.uploadImg({
        key: `ekyc_trading_code_image_${this.props.ekycSdkData.id}`,
        uri: this.localTradingCodeImageUrl,
      });
      this.setState({ showLoading: true });
    }
  };
}

const mapStateToProps = (state: IState) => ({
  ekycSdkData: state.ekycSdkData,
  ekycParams: state.ekycParams,
  ekycUploadImageFailed: state.ekycUploadImageFailed,
});

const EkycForeignInvestor = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, { uploadImg, resetUploadImageStatus })(
      EkycForeignInvestorComponent
    )
  ),
  Fallback,
  handleError
);

export default EkycForeignInvestor;
