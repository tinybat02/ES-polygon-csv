import { DataFrame, Field, Vector } from '@grafana/data';

export interface PanelOptions {
  timezone: string;
  flat_area: { [key: string]: number } | null;
}

export const defaults: PanelOptions = {
  timezone: 'Europe/Berlin',
  flat_area: null,
};

export interface Buffer extends Vector {
  buffer: number[];
}

export interface FieldBuffer extends Field<any, Vector> {
  values: Buffer;
}

export interface Frame extends DataFrame {
  fields: FieldBuffer[];
}

export type CSVRow = {
  [key: string]: any;
} & {
  Timestamp: string;
};
