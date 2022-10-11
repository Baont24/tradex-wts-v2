import * as React from 'react';

interface IReactCaptchaGeneratorState {
  readonly text?: string[];
  readonly captcha?: string;
}

interface IReactCaptchaGeneratorProps {
  readonly width: number;
  readonly height: number;
  readonly textColor: string;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly paddingLeft: number;
  readonly paddingTop: number;
  readonly length: number;
  readonly possible: string;
  readonly background: string;
  readonly toggleRefresh: number;
  readonly setNewCaptCha: (captcha: string) => void;
}

class ReactCaptchaGenerator extends React.Component<
  IReactCaptchaGeneratorProps,
  IReactCaptchaGeneratorState
> {
  static defaultProps = {
    height: 23,
    width: 90,
    textColor: '',
    fontFamily: 'Verdana',
    fontSize: 20,
    paddingLeft: 20,
    paddingTop: 15,
    length: 4,
    background: 'none',
    possible: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    text: '',
    toggleRefresh: 0,
  };

  constructor(props: IReactCaptchaGeneratorProps) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.setData();
  }

  componentDidUpdate(prevProps: IReactCaptchaGeneratorProps) {
    if (
      this.props.toggleRefresh > 0 &&
      this.props.toggleRefresh > prevProps.toggleRefresh
    ) {
      this.setData();
    }
  }

  render() {
    const { height, width } = this.props;
    if (this.state.captcha == null || this.state.text == null) {
      return null;
    }
    let image;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" height="${height}" width="${width}">${this.state.text.join()}</svg>`;
    image = btoa(svg);
    return (
      <img
        style={{ background: this.props.background, height, width }}
        src={`data:image/svg+xml;base64,${image}`}
        alt=""
      />
    );
  }

  setData = () => {
    const localText: string[] = [];
    let captcha: string = '';
    for (let i = 0; i < this.props.length; i++) {
      const char = this.props.possible.charAt(
        Math.floor(Math.random() * this.props.possible.length)
      );
      captcha += char;
      localText.push(
        `<text
                    font-family="${this.props.fontFamily}"
                    font-size="${this.props.fontSize}"
                    x="${this.props.paddingLeft * i}"
                    y="${this.props.paddingTop}"
                    fill="${
                      this.props.textColor ||
                      '#' + (((1 << 24) * Math.random()) | 0).toString(16) // eslint-disable-line
                    }"
                    transform="rotate(${Math.random() * 5})"
                >${char}</text>`
      );
    }
    this.setState(
      {
        captcha,
        text: localText,
      },
      () => this.props.setNewCaptCha(captcha)
    );
  };
}

export default ReactCaptchaGenerator;
