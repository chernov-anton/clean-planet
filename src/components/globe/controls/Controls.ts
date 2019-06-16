import get from 'lodash/get';

interface MouseButtonListener {
  (x: number, y: number): void;
}

interface Zoom {
  (): void;
}

type Coordinate = number;

interface Coordinates {
  startX: Coordinate;
  startY: Coordinate;
  currentX: Coordinate;
  currentY: Coordinate;
}

type CoordinateEvent = MouseEvent | TouchEvent;

class Controls {
  private coordinates: Coordinates | null;
  private touchZoomDistance: number;
  private readonly drag: MouseButtonListener;
  private readonly click: MouseButtonListener;
  private readonly zoomIn: Zoom;
  private readonly zoomOut: Zoom;

  public constructor(
    domObject: HTMLElement,
    drag: MouseButtonListener,
    click: MouseButtonListener,
    zoomIn: Zoom,
    zoomOut: Zoom
  ) {
    this.coordinates = null;
    this.touchZoomDistance = 0;
    this.drag = drag;
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.click = click;

    domObject.addEventListener('wheel', this.mouseWheelHandler);

    domObject.addEventListener('mousedown', this.downHandler);
    domObject.addEventListener('mousemove', this.moveHandler);
    domObject.addEventListener('mouseup', this.endHandler);

    domObject.addEventListener('touchstart', this.downHandler);
    domObject.addEventListener('touchmove', this.moveHandler);
    domObject.addEventListener('touchend', this.endHandler);

    domObject.addEventListener('touchstart', this.zoomStartHandler);
    domObject.addEventListener('touchmove', this.zoomMoveHandler);
  }

  private zoomStartHandler = (e: TouchEvent): void => {
    if (!this.isTwoTouches(e)) {
      return;
    }

    e.preventDefault();
    this.touchZoomDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
  };

  private zoomMoveHandler = (e: TouchEvent): void => {
    if (!this.isTwoTouches(e)) {
      return;
    }

    e.preventDefault();
    const newDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );

    const delta = newDistance - this.touchZoomDistance;
    console.log(delta);
    if (Math.abs(delta) > 10) {
      if (delta < 0) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }

      this.touchZoomDistance = newDistance;
    }
  };

  private mouseWheelHandler = (e: WheelEvent): void => {
    e.preventDefault();
    let delta = Math.max(-1, Math.min(1, -e.deltaY));

    if (delta < 0 && this.zoomOut) {
      this.zoomOut();
    } else if (this.zoomIn) {
      this.zoomIn();
    }
  };

  private getCoordinates = (e: CoordinateEvent): { x: number; y: number } => {
    if (e instanceof MouseEvent) {
      return { x: e.clientX, y: e.clientY };
    }

    return { x: e.touches[0].pageX, y: e.touches[0].pageY };
  };

  private downHandler = (e: CoordinateEvent): void => {
    if (this.isTwoTouches(e)) {
      return;
    }

    e.preventDefault();

    const { x, y } = this.getCoordinates(e);

    this.coordinates = {
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    };
  };

  private moveHandler = (e: CoordinateEvent): void => {
    if (this.isTwoTouches(e)) {
      return;
    }

    e.preventDefault();

    const { x, y } = this.getCoordinates(e);

    if (!this.isInteractionStarted(this.coordinates)) return;

    if (this.drag) {
      this.drag(x - this.coordinates.currentX, y - this.coordinates.currentY);
    }

    this.coordinates.currentX = x;
    this.coordinates.currentY = y;
  };

  private endHandler = (e: CoordinateEvent): void => {
    e.preventDefault();

    if (this.isClicked(this.coordinates)) {
      if (this.click) this.click(this.coordinates.currentX, this.coordinates.currentY);
    }

    this.coordinates = null;
    this.touchZoomDistance = 0;
  };

  private isClicked = (coordinates: Coordinates | null): coordinates is Coordinates =>
    this.isInteractionStarted(coordinates) &&
    !this.isDrag(coordinates) &&
    this.click &&
    !this.touchZoomDistance;

  private isInteractionStarted = (coordinates: Coordinates | null): coordinates is Coordinates =>
    !!coordinates;

  private isDrag = (coordinates: Coordinates): boolean =>
    Math.abs(coordinates.startX - coordinates.currentX) > 3 ||
    Math.abs(coordinates.startY - coordinates.currentY) > 3;

  private isTwoTouches = (e: CoordinateEvent): boolean => {
    return get(e, 'touches.length') === 2;
  };
}

export default Controls;
