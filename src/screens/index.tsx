import * as Loadable from 'react-loadable';
import * as React from 'react';
import { SplashScreen } from 'components/common';

export const Board = Loadable({
  loader: () => import('./Board'),
  loading(props) {
    return props.pastDelay ? <SplashScreen /> : null;
  },
});

export const Login = Loadable({
  loader: () => import('./Login'),
  loading(props) {
    return props.pastDelay ? <SplashScreen /> : null;
  },
});

// export const Account = Loadable({
//   loader: () => import('./Account'),
//   loading(props) {
//     return props.pastDelay ? <SplashScreen /> : null;
//   },
// });
export { default as Account } from './Account';

export const Information = Loadable({
  loader: () => import('./Information'),
  loading(props) {
    return props.pastDelay ? <SplashScreen /> : null;
  },
});
export const ForgotPassword = Loadable({
  loader: () => import('./ForgotPassword'),
  loading(props) {
    return props.pastDelay ? <SplashScreen /> : null;
  },
});
