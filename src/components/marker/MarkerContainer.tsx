import React, { PureComponent, ReactNode } from 'react';
import * as THREE from 'three';
import { Vector3 } from 'three';
import MarkerView from './MarkerView';
import { getCameraProjection, getDisplayPosition, getDistance, getMarkerData } from './markerUtils';

interface Props {
  countryCode: string;
}

type State = React.ComponentProps<typeof MarkerView>;

class MarkerContainer extends PureComponent<Props, State> {
  public state = { isVisible: false, position: { x: 0, y: 0 }, fontSize: 16, text: '' };

  private setPosition(x: number, y: number): void {
    this.setState({ position: { x, y } });
  }

  private setVisibility = (isVisible: boolean): void => {
    this.setState({ isVisible });
  };

  private setSize(size: number): void {
    this.setState({ fontSize: size });
  }

  public update(camera: THREE.Camera, globeMesh: THREE.Object3D, container: HTMLElement): void {
    const matrix = globeMesh.matrixWorld;

    const country = getMarkerData(this.props.countryCode);
    const centerVector = new Vector3(country.center.x, country.center.y, country.center.z);
    const absolutePosition = centerVector.applyMatrix4(matrix);

    let size = (5 - getDistance(camera.position, new Vector3())) * 8;
    this.setSize(size);

    const isVisible = getDistance(camera.position, absolutePosition) < camera.position.length();
    this.setVisibility(isVisible);

    const cameraProjectionPosition = getCameraProjection(absolutePosition, camera);
    let screenPos = getDisplayPosition(cameraProjectionPosition, container);
    this.setPosition(screenPos.x, screenPos.y);
  }

  public render(): ReactNode {
    const { isVisible, position, fontSize } = this.state;
    const { countryCode } = this.props;
    const { countryName } = getMarkerData(countryCode);

    return (
      <MarkerView
        isVisible={isVisible}
        position={position}
        fontSize={fontSize}
        text={countryName}
      />
    );
  }
}

export default MarkerContainer;
