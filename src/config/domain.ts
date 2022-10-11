import { Domain, MatrixOtpType, SplashScreenType } from 'constants/enum';

export type IDomainConfig = {
  [d in Domain]?: {
    readonly [s: string]: boolean | number | string;
  };
};

const defaulConfig: {
  readonly [s: string]: boolean | number | string;
} = {
  headerNameRemain: 'Remain',
  hideNavBarBoard: true,
  indexSliderDropdownClassName: '',
  indexAgCellValue: '',
  isShowETFTab: false,
  isHideType: false,
  hideTotalColumn: true,
  isDoubleClickShowChart: true,
  matrixOtpType: MatrixOtpType.DOUBLE_KEY,
  splashScreenType: SplashScreenType.SPINNER,
};

export const domainConfig: IDomainConfig = {
  [Domain.VCSC]: {
    ...defaulConfig,
    headerNameRemain: 'VCSC Remain',
    deleteIndexOnIndexList: true,
    changeColorSharesBilText: true,
    logoForVcsc: true,
    dropdownItemVcsc: true,
    dropdownMenuVcsc: true,
    indexSliderDropdownClassName: 'SliderDropdownWithVCSC',
    indexAgCellValue: 'AgCellValueWithVCSC',
    isShowETFTab: true,
    isHideType: true,
    hideTotalColumn: false,
  },
  [Domain.MAS]: {
    ...defaulConfig,
    changeBackgroundColorChart: true,
    isHideAndShowQuickOrder: true,
    cashStamentHeaderName: 'Cash at MAS',
    noteForVSD:
      "Note: The remittance fee (5,500 VND) which is subjected to the Bank's prevailing fee schedule will be deducted on your account at MAS",
    isDoubleClickShowChart: false,
  },
  [Domain.KIS]: {
    ...defaulConfig,
    logoForKis: true,
    cashStamentHeaderName: 'Cash at KIS',
    noteForVSD:
      "Note: The remittance fee (5,500 VND) which is subjected to the Bank's prevailing fee schedule will be deducted on your account",
    matrixOtpType: MatrixOtpType.SINGLE_KEY,
    hideInterestExpenseStatement: true,
    splashScreenType: SplashScreenType.LOADINGBAR,
  },
};
