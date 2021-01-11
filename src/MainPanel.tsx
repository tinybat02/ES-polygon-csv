import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Frame } from 'types';
import { processData, csvProcess } from './util/process';
import useCsvDownloader from 'use-csv-downloader';
import CsvIcon from './img/CSV.svg';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

type optionType = 'num_stats' | 'duration_stats' | '';

interface Props extends PanelProps<PanelOptions> {}
interface State {
  num_stats: { polygon: { [key: string]: number[] }; time: number[] } | null;
  duration_stats: { polygon: { [key: string]: (null | number)[] }; time: number[] } | null;
  option: optionType;
}

export class MainPanel extends PureComponent<Props, State> {
  state: State = {
    num_stats: null,
    duration_stats: null,
    option: '',
  };

  componentDidMount() {
    const series = this.props.data.series as Array<Frame>;
    if (series.length == 0) return;

    const { num_stats, duration_stats } = processData(series);
    this.setState(prevState => ({ ...prevState, num_stats, duration_stats }));
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.data.series != this.props.data.series) {
      const series = this.props.data.series as Array<Frame>;
      if (series.length == 0) return;

      const { num_stats, duration_stats } = processData(series);
      this.setState(prevState => ({ ...prevState, num_stats, duration_stats }));
    }
  }

  onOptionSelect = (opt: { label: React.ReactNode; value: optionType }) => this.setState({ option: opt.value });

  onDownload = () => {
    const { option } = this.state;
    const { timezone, flat_area } = this.props.options;

    if (!option || !flat_area) return;

    const downloadCsv = useCsvDownloader({ quote: '', delimiter: ',' });
    if (option == 'num_stats' && this.state.num_stats) {
      const res = csvProcess(this.state.num_stats, timezone, flat_area);
      downloadCsv(res, `${option}.csv`);
    }

    if (option == 'duration_stats' && this.state.duration_stats) {
      const res = csvProcess(this.state.duration_stats, timezone, flat_area, true);
      downloadCsv(res, `${option}.csv`);
    }
  };

  render() {
    const { width, height } = this.props;

    const { option } = this.state;
    return (
      <div
        style={{
          width,
          height,
          padding: 10,
        }}
      >
        <Dropdown
          options={[
            { value: 'num_stats', label: 'Number of Customers' },
            { value: 'duration_stats', label: 'Avg Duration' },
          ]}
          //@ts-ignore
          onChange={this.onOptionSelect}
          placeholder="Choose File to Download"
        />
        <div style={{ width: '100%', height: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {option != '' && <img src={CsvIcon} style={{ height: '50%', cursor: 'pointer' }} onClick={this.onDownload} />}
        </div>
      </div>
    );
  }
}
