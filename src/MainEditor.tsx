import React, { useState } from 'react';
//@ts-ignore
import { FormField, PanelOptionsGroup } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';
import { PanelOptions } from './types';
import { useDropzone } from 'react-dropzone';
import DeleteIcon from './img/DeleteIcon.svg';
import CheckIcon from './img/CheckIcon.svg';
import Exists from './img/Exists.svg';
import None from './img/None.svg';

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

export const MainEditor: React.FC<PanelEditorProps<PanelOptions>> = ({ options, onOptionsChange }) => {
  const [myFiles, setMyFiles] = useState<File[]>([]);
  const [timezone, setFilename] = useState(options.timezone);

  const onSubmit = () => {
    onOptionsChange({ ...options, timezone });
  };

  const onDrop = React.useCallback(
    acceptedFiles => {
      setMyFiles([...myFiles, ...acceptedFiles]);
    },
    [myFiles]
  );

  const { getRootProps, getInputProps, inputRef } = useDropzone({
    noKeyboard: true,
    maxSize: 20971520,
    multiple: true,
    onDrop,
  });

  const handleRemoveFile = (fileName: string) => {
    const dt = new DataTransfer();
    const leftOver = myFiles.filter(f => f.name !== fileName);
    leftOver.map(f => {
      dt.items.add(f);
    });

    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
    setMyFiles(leftOver);
  };

  const addGeoJSON = (fileName: string) => {
    const reader = new FileReader();
    const chosenFile = myFiles.find(f => f.name === fileName);

    reader.onloadend = function() {
      const obj = JSON.parse(reader.result as string);
      onOptionsChange({
        ...options,
        flat_area: obj,
      });
    };
    reader.readAsText(chosenFile as Blob);
  };

  return (
    <PanelOptionsGroup>
      <div className="editor-row">
        <div className="section gf-form-group">
          <h5 className="section-heading">TimeZone</h5>
          <FormField
            label="TimeZone"
            labelWidth={10}
            inputWidth={40}
            type="text"
            value={timezone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
          />
        </div>
        <div className="section gf-form-group">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <h5 className="section-heading" style={{ marginTop: 7 }}>
              Drop Store Area File
            </h5>{' '}
            {options.flat_area ? <img src={Exists} /> : <img src={None} />}
          </div>
          <section>
            <div {...getRootProps({ className: 'dropzone', style: baseStyle })}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop Area File here, or click to select file</p>
            </div>
            {myFiles.length > 0 ? (
              <div>
                <h4>Files</h4>
                <div>
                  {myFiles.map(file => (
                    <p key={file.name}>
                      {file.name} ({file.size} bytes)
                      <button onClick={() => handleRemoveFile(file.name)}>
                        <img src={DeleteIcon} />
                      </button>
                      <button onClick={() => addGeoJSON(file.name)}>
                        <img src={CheckIcon} />
                      </button>
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              ''
            )}
          </section>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onSubmit}>
        Set TimeZone
      </button>
    </PanelOptionsGroup>
  );
};
