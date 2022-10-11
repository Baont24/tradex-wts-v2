import * as React from 'react';
import { formatDateToString } from 'utils/datetime';

export interface IClockProps extends React.ClassAttributes<Clock> {}

export interface IClockState {
  readonly time: Date;
}

export default class Clock extends React.Component<IClockProps, IClockState> {
  private localUpdateTime: NodeJS.Timeout;

  constructor(props: IClockProps) {
    super(props);

    this.state = {
      time: new Date(),
    };
  }

  componentDidMount() {
    this.localUpdateTime = setInterval(() => {
      this.setState({ time: new Date() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.localUpdateTime);
  }

  render() {
    return (
      <span>{formatDateToString(this.state.time, 'HH:mm:ss | dd/MM/yyy')}</span>
    );
  }
}
