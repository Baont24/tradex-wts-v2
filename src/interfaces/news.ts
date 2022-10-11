export interface INews {
  readonly id: number;
  readonly imgUrl?: string;
  readonly title: string;
  readonly link: string;
  readonly source: ISource;
  readonly category: string;
  readonly publishTime: string;
  readonly symbolList: string[];
}

interface ISource {
  readonly id: number;
  readonly name: string;
  readonly logoUrl?: string;
}

export interface INewsListData {
  readonly next?: boolean;
  readonly data?: INews[];
  readonly lastSequence?: string;
  readonly publishTime?: string;
  readonly symbolCode?: string;
  readonly hasMore?: boolean;
}
