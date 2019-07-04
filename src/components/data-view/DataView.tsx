import React, { ReactNode } from 'react';
import styles from './dataView.module.css';

interface Props {
  countryCode: string;
}
const DataView = ({ countryCode }: Props): ReactNode => {
  return <div className={styles.dataView}>{countryCode}</div>;
};

export default DataView;
