interface MouseButtonListener {
  (x: number, y: number): void;
}

interface Zoom {
  (): void;
}

type Coordinate = number | null;

type ControlEvent = MouseEvent | TouchEvent;

class Controls {
  private startX: Coordinate;
  private startY: Coordinate;
  private currentX: Coordinate;
  private currentY: Coordinate;
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
    this.startX = null;
    this.startY = null;
    this.currentX = null;
    this.currentY = null;
    this.drag = drag;
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.click = click;

    domObject.addEventListener('wheel', this.mouseWheelHandler);
    domObject.addEventListener('wheel', this.mouseWheelHandler);

    domObject.addEventListener('mousedown', this.downHandler);
    domObject.addEventListener('mousemove', this.moveHandler);
    domObject.addEventListener('mouseup', this.endHandler);

    domObject.addEventListener('touchstart', this.downHandler);
    domObject.addEventListener('touchmove', this.moveHandler);
    domObject.addEventListener('touchend', this.endHandler);
  }

  private mouseWheelHandler = (e: WheelEvent): void => {
    e.preventDefault();
    let delta = Math.max(-1, Math.min(1, -e.deltaY));

    if (delta < 0 && this.zoomOut) {
      this.zoomOut();
    } else if (this.zoomIn) {
      this.zoomIn();
    }
  };

  private getCoordinates = (e: ControlEvent): { x: number; y: number } => {
    if (e instanceof MouseEvent) {
      return { x: e.clientX, y: e.clientY };
    }

    return { x: e.touches[0].pageX, y: e.touches[0].pageY };
  };

  private downHandler = (e: ControlEvent): void => {
    e.preventDefault();

    const { x, y } = this.getCoordinates(e);
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;
  };

  private moveHandler = (e: ControlEvent): void => {
    e.preventDefault();

    const { x, y } = this.getCoordinates(e);

    if (this.currentX === null || this.currentY === null) return;

    if (this.drag) {
      this.drag(x - this.currentX, y - this.currentY);
    }

    this.currentX = x;
    this.currentY = y;
  };

  private endHandler = (e: ControlEvent): void => {
    e.preventDefault();

    // TODO refactor
    if (
      this.currentX !== null &&
      this.currentY !== null &&
      this.startX !== null &&
      this.startY !== null &&
      Math.abs(this.startX - this.currentX) < 3 &&
      Math.abs(this.startY - this.currentY) < 3
    ) {
      if (this.click) this.click(this.currentX, this.currentY);
    }

    this.startX = null;
    this.startY = null;
    this.currentX = null;
    this.currentY = null;
  };
}

export default Controls;
