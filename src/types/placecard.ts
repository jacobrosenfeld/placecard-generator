export type Unit = "in" | "mm" | "pt";

export type FoldType = "horizontal-tent" | "vertical-tent";

export type OutputMode = "single-up" | "proof";

export type FontWeight = "light" | "normal" | "bold";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CardLayout = {
  finishedWidthPt: number;
  finishedHeightPt: number;
  flatWidthPt: number;
  flatHeightPt: number;
  bleedPt: number;
  safeMarginPt: number;
  foldLineY: number;
  topPanel: Rect;
  bottomPanel: Rect;
};

export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  minFontSize: number;
  fontWeight: FontWeight;
  align: "left" | "center" | "right";
  uppercase: boolean;
  maxLines: number;
  color: string;
};

export type LogoPlacement =
  | "above-name"
  | "below-name"
  | "above-table"
  | "both-panels";

export type LogoSettings = {
  fileName: string;
  dataUrl: string;
  mimeType: string;
  placement: LogoPlacement;
  maxWidthPercent: number;
  maxHeightPercent: number;
  naturalWidth?: number;
  naturalHeight?: number;
  warnings: string[];
};

export type ProjectSettings = {
  projectName: string;
  clientName: string;
  finishedWidth: number;
  finishedHeight: number;
  unit: Unit;
  foldType: FoldType;
  bleed: number;
  safeMargin: number;
  outputMode: OutputMode;
  includeLogo: boolean;
  logo?: LogoSettings;
  nameText: TextStyle;
  tableText: TextStyle;
};

export type GuestRow = {
  id: string;
  name: string;
  tableRaw: string;
  tableLabel: string;
  sourceRowNumber: number;
  warnings: string[];
};

export type ParsedGuestList = {
  columns: string[];
  rows: string[][];
  hasHeader: boolean;
  nameColumnIndex: number;
  tableColumnIndex: number;
  warnings: string[];
};

export type RenderedCard = {
  guest: GuestRow;
  layout: CardLayout;
  settings: ProjectSettings;
};
