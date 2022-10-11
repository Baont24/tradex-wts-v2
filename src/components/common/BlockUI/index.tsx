import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { IAction } from 'interfaces/common';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import ReduxBlockUI from 'react-block-ui/redux';
import Spinner from '../Spinner';

export interface IBlockUIProps extends React.ClassAttributes<HTMLDivElement> {
  readonly blocking?: boolean;
  readonly keepInView?: boolean;
  readonly renderChildren?: boolean; // default to true
  readonly className?: string;
  readonly message?: string | React.ReactNode;
  readonly loader?: string | Function | React.ReactNode;
  readonly tag?: string | Function;
  readonly block?:
    | RegExp
    | string
    | string[]
    | (<T>(action: IAction<T>) => boolean);
  readonly unblock?:
    | RegExp
    | string
    | string[]
    | (<T>(action: IAction<T>) => boolean);
  readonly onChange?: (newValue: number, oldValue: number) => void;
  readonly onClick?: Function;
}

class BlockUIComponent extends React.Component<IBlockUIProps> {
  constructor(props: IBlockUIProps) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <ReduxBlockUI
        {...this.props}
        loader={this.props.loader || <Spinner size={50} logo={false} />}
        className={`${styles.BlockUI} ${this.props.className || ''}`}
      >
        {this.props.children}
      </ReduxBlockUI>
    );
  }
}

const BlockUI = withErrorBoundary(BlockUIComponent, Fallback, handleError);

export default BlockUI;
