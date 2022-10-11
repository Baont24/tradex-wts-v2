import { COMMON_SHOW_NOTIFICATION } from 'redux/actions';
import { EKYC_CHANGE_PARAMS, UPLOAD_IMAGE } from 'screens/KisEkyc/action';
import { IEkycParams, IEkycUploadImgParams } from 'interfaces/ekyc';
import { IRequest } from 'interfaces/common';
import { METHOD } from 'utils/METHOD';
import { ToastType as NOTIFICATION_TYPE } from 'react-toastify';
import { WS } from 'constants/enum';
import { call, put, takeEvery } from 'redux-saga/effects';
import Resizer from 'react-image-file-resizer';
import config from 'config';

const getTypeOfImage = (key: string, url: string): IEkycParams => {
  if (key.includes('front_image')) {
    return { frontImageUrl: url };
  } else if (key.includes('back_image')) {
    return { backImageUrl: url };
  } else if (key.includes('signature_image')) {
    return { signatureImageUrl: url };
  } else if (key.includes('trading_code')) {
    return { tradingCodeImageUrl: url };
  } else {
    return { portraitImageUrl: url };
  }
};

export const getPresignedUrl = async (key: string) => {
  const baseUri = `${config.rest.baseUri[WS.EKYC]}/api/v1/`;
  const uri = `${baseUri}aws?serviceName=ekyc&key=${key}`;
  return new Promise((resolve, reject) => {
    fetch(uri, {
      method: METHOD.GET,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(async (result) => {
        resolve(await result.text());
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const resizeFile = (file: Blob) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      450,
      300,
      'JPEG',
      90,
      0,
      (uri) => {
        resolve(uri);
      },
      'blob'
    );
  });

export const uploadImage = async (url: string, imageUri: string) => {
  try {
    const respblob = await fetch(imageUri);
    const image = await resizeFile(await respblob.blob());
    await fetch(url, {
      method: 'PUT',
      body: image as Blob,
    });
  } catch (err) {
    console.log('Resize File', err);
  }
};

function* doUploadImage(request: IRequest<IEkycUploadImgParams>) {
  try {
    const responseUrl = yield call(getPresignedUrl, request.payload.key);
    try {
      yield call(uploadImage, responseUrl, request.payload.uri);
      const url = responseUrl.split('?')[0];
      yield put({
        type: EKYC_CHANGE_PARAMS,
        payload: getTypeOfImage(request.payload.key, url),
      });
    } catch (error) {
      yield put({
        type: COMMON_SHOW_NOTIFICATION,
        payload: {
          type: NOTIFICATION_TYPE.ERROR,
          title: 'Upload Image',
          content: error.code ? error.code : error.message,
          time: new Date(),
        },
      });
      yield put({
        type: request.response.failed,
      });
    }
  } catch (error) {
    yield put({
      type: request.response.failed,
    });
    yield put({
      type: COMMON_SHOW_NOTIFICATION,
      payload: {
        type: NOTIFICATION_TYPE.ERROR,
        title: 'Upload Image',
        content: error.code ? error.code : error.message,
        time: new Date(),
      },
    });
  }
}

export function* watchUploadImage() {
  yield takeEvery(UPLOAD_IMAGE, doUploadImage);
}
