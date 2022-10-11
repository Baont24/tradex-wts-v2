import * as React from 'react';
import * as style from './style.scss';
import { Fallback } from 'components/common';
import { IState } from 'redux/global-reducers';
import { Investor } from 'interfaces/ekyc';
import { ListOfSteps } from '../Common/helper';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { handleError } from 'utils/common';
import { selectInvestor } from '../action';
import { withErrorBoundary } from 'react-error-boundary';

const notes = [
  "Document must be valid. It's still in original form and not a copy/scanned copy one.",
  'Place the document in front of the webcam. Adjust the position of the document until the document is properly displayed on your screen.',
  'Ensure your document details are clear to read with no blur or glare.',
  'Please use the computer supporting camera',
];

export interface IStep1Props
  extends React.ClassAttributes<Step1Component>,
    WithNamespaces {
  readonly allowToNextStep: (step: string) => void;
  readonly selectInvestor: typeof selectInvestor;
}

export interface IStep1State {
  readonly isShowInto: boolean;
  readonly investor: Investor;
}

class Step1Component extends React.Component<IStep1Props, IStep1State> {
  constructor(props: IStep1Props) {
    super(props);
    this.state = {
      isShowInto: false,
      investor: Investor.VN,
    };
  }

  render() {
    const { t } = this.props;
    const investor = (
      <>
        <p className={style.Title}>{t('You are Investor?')}</p>
        <div className={style.SelectInvestor}>
          <div className={style.VN}>
            <div
              className={style.SelectBox}
              onClick={() => this.chooseInvestor(Investor.VN)}
            >
              <p>{t('Vietnamese Investor')}</p>
            </div>
          </div>
          <div className={style.NN}>
            <div
              className={style.SelectBox}
              onClick={() => this.chooseInvestor(Investor.FR)}
            >
              <p>{t('Foreign Investor')}</p>
            </div>
          </div>
        </div>
      </>
    );
    const introduction = (
      <>
        <p className={style.IntroductionTitle}>
          {t(
            'Please take photos of both sides of your ID Card/ Citizen Card/ Passport'
          )}
        </p>
        <div className={style.NoteSection}>
          <div>
            {notes.map((note, i) => (
              <div className={style.Note} key={i}>
                <div className={style.NoteIndex}>{i + 1}</div>
                <div className={style.NoteText}>{t(note)}</div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
    return (
      <div className={style.Step1}>
        {this.state.isShowInto ? introduction : investor}
      </div>
    );
  }

  private chooseInvestor = (investor: Investor) => {
    this.setState({ isShowInto: true, investor });
    this.props.selectInvestor(investor);
    this.props.allowToNextStep(ListOfSteps.InvestorGuide);
  };
}

const mapStateToProps = (state: IState) => ({});

const Step1 = withErrorBoundary(
  withNamespaces('common')(
    connect(mapStateToProps, { selectInvestor })(Step1Component)
  ),
  Fallback,
  handleError
);

export default Step1;
