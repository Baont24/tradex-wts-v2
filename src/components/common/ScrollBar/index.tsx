import * as React from 'react';
import * as classNames from 'classnames';
import * as styles from './styles.scss';
import { Fallback } from 'components/common';
import { ScrollbarProps } from 'react-custom-scrollbars';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import CustomScrollBar from '@kartikag01/react-custom-scrollbars';

class ScrollBarComponent extends React.Component<ScrollbarProps> {
  constructor(props: ScrollbarProps) {
    super(props);
  }

  render() {
    const { className, ...props } = this.props;

    return (
      <CustomScrollBar
        className={classNames(styles.ScrollBar, className)}
        {...props}
      >
        {this.props.children}
      </CustomScrollBar>
    );
  }
}

const ScrollBar = withErrorBoundary(ScrollBarComponent, Fallback, handleError);

export default ScrollBar;
