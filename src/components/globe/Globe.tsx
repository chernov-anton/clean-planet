import React, { PureComponent, ReactNode, RefObject } from 'react';
import Marker from 'components/marker';
import DataView from 'components/data-view';
import GlobeModel from './GlobeModel';
import GlobeModelFactory from './GlobeModelFactory';
import GlobeController from './GlobeController';

interface State {
  countryCode: string | null;
}

class Globe extends PureComponent<{}, State> {
  private globeModel?: GlobeModel;
  private globeController?: GlobeController;
  private readonly mainRef: RefObject<HTMLElement>;
  private readonly markerRef: RefObject<Marker>;

  public constructor(props: {}) {
    super(props);

    this.mainRef = React.createRef();
    this.markerRef = React.createRef();
    this.state = { countryCode: null };
  }

  public componentDidMount(): void {
    if (this.mainRef.current) {
      this.globeModel = GlobeModelFactory.init(this.mainRef.current);
      this.globeController = new GlobeController(this.globeModel, this.setCountry);
      this.globeController.addRenderFunc(this.updateMarker);
      this.globeController.show();
    }
  }

  private setCountry = (countryCode: string): void => this.setState({ countryCode });

  private updateMarker = (): void => {
    if (this.mainRef.current && this.markerRef.current && this.globeModel) {
      this.markerRef.current.update(
        this.globeModel.camera,
        this.globeModel.globeMesh,
        this.mainRef.current
      );
    }
  };

  public render(): ReactNode {
    const { countryCode } = this.state;
    console.log(countryCode);
    return (
      <>
        <main ref={this.mainRef} />
        {countryCode && (
          <>
            <Marker countryCode={countryCode} ref={this.markerRef} />
            <DataView countryCode={countryCode} />
          </>
        )}
      </>
    );
  }
}

export default Globe;
