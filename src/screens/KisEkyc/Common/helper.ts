import { IEkycPersonalInfoType } from 'interfaces/ekyc';

export enum DocumentType {
  CC = 'Căn cước công dân',
  CCCD = 'CĂN CƯỚC CÔNG DÂN',
  CMND = 'GIẤY CHỨNG MINH NHÂN DÂN',
  CMND12 = 'CHỨNG MINH NHÂN DÂN',
}

export const getDocumentType = (document: string): IEkycPersonalInfoType => {
  switch (document) {
    case DocumentType.CC:
      return 'CC';
    case DocumentType.CCCD:
      return 'CC';
    case DocumentType.CMND:
      return 'CMND';
    case DocumentType.CMND12:
      return 'CMND';
    default:
      return 'PASSPORT';
  }
};

export const emailValidator = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const phoneValidator = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
export const dateFormatCheck = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
export const contactAddress = /^[a-zA-Z0-9\/\-\?\:\(\)\.,'+ ]*$/;
export const contactAddressCheck = (str: string) => {
  return contactAddress.test(
    str
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  );
};

export enum ListOfSteps {
  SelectInvestor = 'SelectInvestor',
  InvestorGuide = 'InvestorGuide',
  SDK = 'SDK',
  SDKDone = 'SDKDone',
  CheckInfo = 'CheckInfo',
  PersonalInfo = 'PersonalInfo',
  PersonalInfoDone = 'PersonalInfoDone',
  ServiceInfo = 'ServiceInfo',
  UploadSignature = 'UploadSignature',
  UploadSignatureDone = 'UploadSignatureDone',
  UploadConfirmImg = 'UploadConfirmImg',
  UploadConfirmImgDone = 'UploadConfirmImgDone',
  UploadSignatureAndImgDone = 'UploadSignatureAndImgDone',
  OTP = 'OTP',
  DONE = 'DONE',
}
