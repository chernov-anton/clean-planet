import React, { ReactElement } from 'react';
import style from './marker.module.css';

export interface Props {
  isVisible: boolean;
  position: {
    x: number;
    y: number;
  };
  fontSize: number;
  text: string;
}

const MarkerView = ({ isVisible, position, fontSize, text }: Props): ReactElement => {
  const viewStyle = {
    display: isVisible ? 'inline' : 'none',
    left: position.x,
    top: position.y,
    fontSize: fontSize,
  };

  return (
    <div style={viewStyle} className={style.marker}>
      {text}
    </div>
  );
};

export default MarkerView;
