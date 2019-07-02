import React, { ReactElement } from 'react';

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
  return (
    <table
      style={{
        display: isVisible ? 'inline' : 'none',
        left: position.x,
        top: position.y,
        fontSize: fontSize,
      }}
      className="marker"
    >
      <tbody>
        <tr>
          <td>
            <span className="country">{text}</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default MarkerView;
