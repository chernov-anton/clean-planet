import React, { PureComponent, ReactNode, RefObject } from 'react';
import Marker from '../marker';
import GlobeModel from './GlobeModel';
import GlobeModelFactory from './GlobeModelFactory';
import GlobeController from './GlobeController';

interface Props {
  className: string;
}

interface State {
  country: string | null;
}

class Globe extends PureComponent<Props, State> {
  private globeModel?: GlobeModel;
  private globeController?: GlobeController;
  private readonly mainRef: RefObject<HTMLElement>;
  private readonly markerRef: RefObject<Marker>;

  public constructor(props: Props) {
    super(props);

    this.mainRef = React.createRef();
    this.markerRef = React.createRef();
    this.state = { country: null };
  }

  public componentDidMount(): void {
    if (this.mainRef.current) {
      this.globeModel = GlobeModelFactory.init(this.mainRef.current);
      this.globeController = new GlobeController(this.globeModel, this.setCountry);
      this.globeController.addRenderFunc(this.updateMarker);
      this.globeController.show();
    }
  }

  private setCountry = (country: string): void => this.setState({ country });

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
    const { country } = this.state;
    return (
      <>
        <main className={this.props.className} ref={this.mainRef} />
        {country && <Marker countryCode={country} ref={this.markerRef} />}
      </>
    );
  }
}

export default Globe;
