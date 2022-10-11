import { IParams } from './common';

export interface IEkycResponse {
  readonly compare: {
    readonly challengeCode: string;
    readonly dataBase64: string;
    readonly dataSign: string;
    readonly logID: string;
    readonly object: {
      readonly result: string;
      readonly msg: string;
      readonly prob: number;
      readonly multiple_faces: boolean;
    };
    readonly statusCode: 200;
  };
  readonly image_base64: {
    readonly img_face: string;
    readonly img_back: string;
    readonly img_front: string;
  };
  readonly ocr: {
    readonly object: IEKycInfo;
  };
}

export interface IEKycInfo {
  readonly back_expire_warning: string;
  readonly back_type_id: number;
  readonly birth_day: string;
  readonly birth_day_prob: number;
  readonly card_type: string;
  readonly citizen_id: string;
  readonly citizen_id_prob: number;
  readonly corner_warning: string;
  readonly expire_warning: string;
  readonly gender: string;
  readonly id: string;
  readonly id_fake_prob: number;
  readonly id_fake_warning: string;
  readonly id_probs: string;
  readonly issue_date: string;
  readonly issue_date_prob: number;
  readonly issue_date_probs: number[];
  readonly issue_date_warning: string;
  readonly issue_place: string;
  readonly issue_place_prob: number;
  readonly msg: string;
  readonly msg_back: string;
  readonly name: string;
  readonly name_fake_warning: string;
  readonly name_prob: number;
  readonly nation_policy: string;
  readonly nationality: string;
  readonly origin_location: string;
  readonly origin_location_prob: number;
  readonly post_code: string[];
  readonly recent_location: string;
  readonly recent_location_prob: number;
  readonly type_id: number;
  readonly valid_date: string;
  readonly valid_date_prob: number;
  readonly warning: string[];
  readonly warning_msg: string[];
  readonly imgBase64: {
    readonly img_face: string;
    readonly img_back: string;
    readonly img_front: string;
  };
}

export enum Investor {
  VN = -1,
  FR = 5,
}

export interface IEkycParams extends IParams {
  readonly identifierId?: string;
  readonly fullName?: string;
  readonly phoneNo?: string;
  readonly gender?: string;
  readonly type?: IEkycPersonalInfoType; // CMND, CC, PASSPORT
  readonly birthDay?: string;
  //YYYYMMDD
  readonly expiredDate?: string;
  //YYYYMMDD
  readonly issueDate?: string;
  //YYYYMMDD
  readonly issuePlace?: string;
  //YYYYMMDD
  readonly address?: string;
  readonly frontImageUrl?: string;
  readonly backImageUrl?: string;
  readonly portraitImageUrl?: string;
  readonly signatureImageUrl?: string;
  readonly isMargin?: boolean;
  readonly matchingRate?: number;
  readonly occupation?: string;
  readonly homeTown?: string;
  readonly permanentProvince?: string;
  readonly permanentDistrict?: string;
  readonly permanentAddress?: string;
  readonly contactProvince?: string;
  readonly contactDistrict?: string;
  readonly contactAddress?: string;
  readonly email?: string;
  readonly referrerIdName?: string;
  readonly referrerBranch?: string;
  readonly bankAccount?: string;
  readonly accountName?: string;
  readonly bankName?: string;
  readonly branch?: string;
  readonly nationality?: string;
  readonly tradingCodeImageUrl?: string;
}

export interface IEkycOTPParams extends IParams {
  readonly id?: string;
  readonly idType: string;
  readonly txType: string;
}

export interface IEkycVerifyOTPParams extends IParams {
  readonly otpId?: string;
  readonly otpValue: string;
}

export interface IEkycUploadImgParams extends IParams {
  readonly uri: string;
  readonly key: string;
}

export type IEkycPersonalInfoType = 'CMND' | 'CC' | 'PASSPORT';
