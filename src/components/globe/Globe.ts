import { CountryChangeCallback } from './types';
import GlobeModel from './GlobeModel';
import GlobeModelFactory from './GlobeModelFactory';
import GlobeController from './GlobeController';

class Globe {
  private readonly globeModel: GlobeModel;
  private readonly globeController: GlobeController;

  public constructor(container: HTMLElement, onCountryChange: CountryChangeCallback) {
    this.globeModel = GlobeModelFactory.init(container);
    this.globeController = new GlobeController(this.globeModel, onCountryChange);
  }

  public render(): void {
    this.globeController.show();
  }
}

export default Globe;
