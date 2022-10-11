import * as Loadable from 'react-loadable';
import * as React from 'react';
import Fallback from './Fallback';

export const SymbolInfo = Loadable({
  loader: () => import('./SymbolInfo'),
  loading(props) {
    return props.pastDelay ? <Fallback /> : null;
  },
});

export { default as Fallback } from './Fallback';
export { default as Notification } from './Notification';
export { default as NavBar } from './NavBar';
export { default as SymbolSearch } from './SymbolSearch';
export { default as Dropdown } from './Dropdown';
export { default as Spinner } from './Spinner';
export { default as SplashScreen } from './SplashScreen';
export { default as Layout } from './Layout';
export { default as LanguageSwitcher } from './LanguageSwitcher';
export { default as IconRejectStatusTooltip } from './GridCustomCell/IconRejectStatusCell';
export { default as ToggleGroupHeader } from './GridCustomCell/ToggleGroupHeader';
export { default as ToggleHeader } from './GridCustomCell/ToggleHeader';
export { default as SymbolQuote } from './SymbolQuote';
export { default as SymbolPriceDepth } from './SymbolPriceDepth';
export { default as TVChart } from './TVChart';
export { default as TabTable } from './TabTable';
export { default as BlockUI } from './BlockUI';
export { default as AccountDropdown } from './AccountDropdown';
export { default as ScrollBar } from './ScrollBar';
export { default as NumericInput } from './NumericInput';
export { default as DatePicker } from './DatePicker';
export { default as DateRangePicker } from './DateRangePicker';
export { default as IndexBoard } from './IndexBoard';
export { default as CheckBox } from './CheckBox';
export { default as TextBox } from './TextBox';
export { default as SpeedOrder } from './SpeedOrder';
export { default as Otp } from './Otp';
export { default as SheetData } from './SheetData';
export { default as OrderForm } from './OrderForm';
export { default as QuantityInput } from './QuantityInput';
export { default as PriceInput } from './PriceInput';
export { default as OtpModal } from './OtpModal';
export { default as Modal } from './Modal';
export { default as ModifyOrderForm } from './ModifyOrderForm';
export { default as CaptchaGenerator } from './CaptchaGenerator';
export { default as AuthRoute } from './Routes/AuthRoute';
export { default as CommonRoute } from './Routes/CommonRoute';
export { default as StockBoard } from './StockBoard';
