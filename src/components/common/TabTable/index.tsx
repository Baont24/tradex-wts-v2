import * as React from 'react';
import * as styles from './styles.scss';
import { Fallback } from '..';
import { ITabTableData } from 'interfaces/common';
import { Nav, Tab } from 'react-bootstrap';
import { WithNamespaces, withNamespaces } from 'react-i18next';
import { handleError } from 'utils/common';
import { withErrorBoundary } from 'react-error-boundary';
import classNames from 'classnames';

export interface ITabTableProps extends WithNamespaces {
  readonly data: ITabTableData[];
  readonly cornerLogo?: React.ReactNode;
  readonly customNavTab?: React.ReactNode;
  readonly isSimpleTab?: boolean;
  readonly onCornerLogoClick?: () => void;
  readonly onSelect?: (eventKey: string) => void;
}

export interface ITabTableState {
  readonly activeKey: string;
}

class TabTableComponent extends React.Component<
  ITabTableProps,
  ITabTableState
> {
  constructor(props: ITabTableProps) {
    super(props);
    const defaultTab =
      this.props.data.find((val) => val.default) || this.props.data[0];
    this.state = {
      activeKey: defaultTab.key,
    };
  }

  componentDidUpdate(prevProps: ITabTableProps) {
    if (prevProps.data !== this.props.data) {
      const key = this.props.data.find(
        (val) => val.key === this.state.activeKey
      );
      if (!key) {
        this.setState({ activeKey: this.props.data[0].key });
      }
    }
  }

  render() {
    const defaultTab =
      this.props.data.find((val) => val.default) || this.props.data[0];

    return (
      <div className={styles.TabTable}>
        <Tab.Container
          defaultActiveKey={defaultTab?.key}
          activeKey={this.state.activeKey}
          mountOnEnter={true}
          unmountOnExit={true}
          onSelect={this.onSelect}
        >
          <Nav
            className={classNames(styles.NavTab, {
              [styles.SimpleNavBar]: this.props.isSimpleTab,
            })}
            variant="tabs"
            defaultActiveKey={defaultTab?.key}
          >
            {this.props.data.map(
              (val, idx) =>
                !val.hide && (
                  <Nav.Item key={idx}>
                    <Nav.Link eventKey={val.key}>
                      {this.props.t(val.title)}
                    </Nav.Link>
                    <div className={styles.ActiveTab} />
                  </Nav.Item>
                )
            )}
            {this.props.customNavTab}
            {this.props.cornerLogo && (
              <div
                className={styles.DetailButton}
                onClick={this.onCornerLogoClick}
              >
                {this.props.cornerLogo}
              </div>
            )}
          </Nav>
          <Tab.Content className={styles.TabContent}>
            {this.props.data.map(
              (val, idx) =>
                !val.hide && (
                  <Tab.Pane key={idx} eventKey={val.key}>
                    {val.component}
                  </Tab.Pane>
                )
            )}
          </Tab.Content>
        </Tab.Container>
      </div>
    );
  }

  private onCornerLogoClick = () => {
    this.props.onCornerLogoClick?.();
  };

  private onSelect = (eventKey: string) => {
    this.setState({ activeKey: eventKey });
    this.props.onSelect?.(eventKey);
  };
}

const TabTable = withErrorBoundary(
  withNamespaces('common')(TabTableComponent),
  Fallback,
  handleError
);

export default TabTable;
