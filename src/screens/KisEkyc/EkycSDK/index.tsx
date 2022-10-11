import * as React from 'react';
// import * as style from './style.scss';
import './ekyc-web-sdk-1.0.6.5.css';
// import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { Fallback } from 'components/common';
import { IEkycResponse } from 'interfaces/ekyc';
import { IState } from 'redux/global-reducers';
import { ListOfSteps } from '../Common/helper';
import { ToastType as NOTIFICATION_TYPE } from 'react-toastify';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { changeEkycParams, setEkycSDKData, uploadImg } from '../action';
import { connect } from 'react-redux';
import { ekycsdk } from './ekyc-web-sdk-1.0.6.5';
import { handleError } from 'utils/common';
import { showNotification } from 'redux/global-actions';
import { withErrorBoundary } from 'react-error-boundary';

const TOKEN_KEY =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJn+UqSUGKre5hEzgw0w95LdKXpbcjPTggz7Aaw5AJXWqTPgZRK5dT4/S7kbIgvm7FNbYGXAgEbhydsdFAMU7/kCAwEAAQ==';

const TOKEN_ID = 'c3c513a9-4582-b2fe-e053-604fc10a24b1';

const AUTHORIZION =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0N2M5YTU3Mi03Njg0LTExZWItOGUyZi0yNTQ5ZDNmNGY0YzIiLCJhdWQiOlsicmVzdHNlcnZpY2UiXSwidXNlcl9uYW1lIjoicWxzcGljQGlkZy52bnB0LnZuIiwic2NvcGUiOlsicmVhZCJdLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdCIsIm5hbWUiOiJxbHNwaWNAaWRnLnZucHQudm4iLCJ1dWlkX2FjY291bnQiOiI0N2M5YTU3Mi03Njg0LTExZWItOGUyZi0yNTQ5ZDNmNGY0YzIiLCJhdXRob3JpdGllcyI6WyJVU0VSIl0sImp0aSI6Ijk2YzJmZjVlLTBkMDAtNDkzOS05YmRmLWM3NzkxOGFmZjUwOSIsImNsaWVudF9pZCI6ImFkbWluYXBwIn0.gWZkI5CqWgwcs9JOcQ4PPLjKUIZUxjtqIXl5ADti-AGej80XGfZIejTEWiMBRaKtOrQxmqu6YjQPe5xcg7onnK9uH0n4hkeRyGBlzixL4rEXH2CieegENjUFAjv6bAi-ahZwHxd5p5I6dNbh6kdYfzAH2YKFiTP5ElAfk2aliOqDMDjmQjYeIx8h05Jwl6Z9y1aIdme_iLfGzgNk9dyhhDoVtsGV3_mqd_f0qPGtOOo1TM9o7zsd9myNUudnPQlE0GvW6Fo8SEkHOgsfgfuzcsBYO__XuGCs0AtCjTt9srwMzASIg20CBCh3b_vLpSLDDoMTUqHGKHx1lColfWaRpA';

export interface IEkycProps
  extends React.ClassAttributes<EkycComponent>,
    WithNamespaces {
  readonly ekycDocumentType: IState['ekycDocumentType'];
  readonly lang: IState['lang'];
  readonly forceUsingEnglish?: boolean;
  readonly changeEkycParams: typeof changeEkycParams;
  readonly allowToNextStep: (step: string) => void;
  readonly setEkycSDKData: typeof setEkycSDKData;
  readonly uploadImg: typeof uploadImg;
  readonly showNotification: typeof showNotification;
}

export interface IEkycState {}

class EkycComponent extends React.Component<IEkycProps, IEkycState> {
  constructor(props: IEkycProps) {
    super(props);
  }

  componentDidMount() {
    this.props.allowToNextStep(ListOfSteps.SDK);
    const initObj = {
      BACKEND_URL: 'https://api.idg.vnpt.vn/',
      TOKEN_KEY,
      TOKEN_ID,
      AUTHORIZION,
      ENABLE_GGCAPCHAR: true,
      PARRENT_ID: 'ekyc_sdk_intergrated',
      FLOW_TYPE: 'FULL', // DOCUMENT, FACE ,FULL
      SHOW_RESULT: false,
      SHOW_HELP: false,
      SHOW_TRADEMARK: false,
      CHECK_LIVENESS_CARD: true,
      CHECK_LIVENESS_FACE: true,
      CHECK_MASKED_FACE: true,
      COMPARE_FACE: true,
      LANGUAGE: this.props.forceUsingEnglish ? 'en' : this.props.lang,
      LIST_ITEM: [-1, 5, 6, 7],
      TYPE_DOCUMENT: this.props.ekycDocumentType,
      USE_WEBCAM: true,
      USE_UPLOAD: false,
      LIST_CHOOSE_STYLE: {
        background: '#fff',
        text_color: 'black',
        border_item: '',
        item_active_color: '#005eac',
        background_icon: '#005eac',
        id_icon: 'https://ekyc-web.icenter.ai/images/si/id_card.svg',
        passport_icon: 'https://ekyc-web.icenter.ai/images/si/passport.svg',
        drivecard_icon: 'https://ekyc-web.icenter.ai/images/si/drivecard.svg',
        army_id_icon: 'https://ekyc-web.icenter.ai/images/si/other_doc.svg',
        id_chip_icon: 'https://ekyc-web.icenter.ai/images/si/id_chip.svg',
        start_button_background: '#005eac',
        start_button_color: '#111127',
      },
      CAPTURE_IMAGE_STYLE: {
        popup1_box_shadow:
          '0px 0px 2px rgba(0, 0, 0, 0.06), 0px 3px 8px rgba(0, 0, 0, 0.1)',
        popup1_title_color: '#C8242D',
        description1_color: '#111127',
        capture_btn_background: '#005eac',
        capture_btn_color: '#fff',
        capture_btn_icon:
          'https://ekyc-web.icenter.ai/images/hdbank/capture.svg',
        tutorial_btn_icon: 'https://ekyc-web.icenter.ai/images/hdbank/help.gif',
        recapture_btn_background: ' #659AD2',
        recapture_btn_color: '#fff',
        recapture_btn_border: 'none',
        recapture_btn_icon:
          'https://ekyc-web.icenter.ai/images/hdbank/capture.svg',
        nextstep_btn_background: '#005eac',
        nextstep_btn_color: '#fff',
        nextstep_btn_icon:
          'https://ekyc-web.icenter.ai/images/hdbank/next_icon.svg',
        popup2_box_shadow:
          '0px 0px 2px rgba(0, 0, 0, 0.06), 0px 3px 8px rgba(0, 0, 0, 0.1)',
        popup2_title_header_color: '#C8242D',
        popup2_icon_header:
          'https://ekyc-web.icenter.ai/images/hdbank/main_icon.svg',
        popup2_icon_warning1: '',
        popup2_icon_warning2: '',
        popup2_icon_warning3: '',
      },
      RESULT_DEFAULT_STYLE: {
        redemo_btn_background: '#005eac',
        redemo_btn_icon:
          'https://ekyc-web.icenter.ai/images/hdbank/refresh.svg',
        redemo_btn_color: '#fff',
      },
      MOBILE_STYLE: {
        mobile_capture_btn:
          'https://ekyc-web.icenter.ai/images/hdbank/capture_mobile.svg',
        mobile_capture_desc_color: '#FEDC00',
        mobile_tutorial_color: '#C8242D',
        mobile_recapture_btn_background: '#005eac',
        mobile_recapture_btn_border: '1px solid #FEDC00',
        mobile_recapture_btn_icon:
          'https://ekyc-web.icenter.ai/images/hdbank/capture.svg',
        mobile_recapture_btn_color: '#111127',
        mobile_nextstep_btn_background: '#005eac',
        mobile_nextstep_btn_color: '#111127',
        mobile_nextstep_btn_icon:
          'https://ekyc-web.icenter.ai/images/hdbank/next_icon.svg',
        mobile_popup2_icon_header:
          'https://ekyc-web.icenter.ai/images/hdbank/face_icon_popup.svg',
      },
    };

    ekycsdk.init(initObj, (res: IEkycResponse) => {
      const ekycData = res.ocr?.object;
      const compare = res.compare?.object;
      const imgBase64 = res?.image_base64;
      if (ekycData && compare.msg === 'MATCH') {
        this.props.changeEkycParams({ matchingRate: compare.prob });
        this.props.setEkycSDKData({ ...ekycData, imgBase64 });
        this.props.allowToNextStep(ListOfSteps.SDKDone);
        const nextButton = document.querySelector('.NextButton');
        if (nextButton) {
          (nextButton as HTMLElement).click();
        }
      } else {
        this.props.showNotification({
          type: NOTIFICATION_TYPE.ERROR,
          title: 'EKYC',
          content: 'EKYC Failed',
          time: new Date(),
        });
      }
    });
  }

  render() {
    return <div id="ekyc_sdk_intergrated" />;
  }
}

const mapStateToProps = (state: IState) => ({
  ekycDocumentType: state.ekycDocumentType,
  lang: state.lang,
});

const mapDispatchToProps = {
  setEkycSDKData,
  showNotification,
  changeEkycParams,
  uploadImg,
};

const Ekyc = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, mapDispatchToProps)(EkycComponent)
  ),
  Fallback,
  handleError
);

export default Ekyc;
