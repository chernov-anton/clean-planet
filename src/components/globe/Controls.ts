interface MouseButtonListener {
  (x: number, y: number): void;
}

interface Zoom {
  (): void;
}

type Coordinate = number | null;

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

    domObject.addEventListener('wheel', this.mouseWheelHandler.bind(this));
    domObject.addEventListener('wheel', this.mouseWheelHandler.bind(this));
    domObject.addEventListener('mousedown', this.mouseDownHandler.bind(this));
    domObject.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
    domObject.addEventListener('mouseup', this.mouseUpHandler.bind(this));
    domObject.addEventListener('click', this.clickHandler.bind(this));
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

  private mouseDownHandler = (e: MouseEvent): void => {
    e.preventDefault();
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.currentX = e.clientX;
    this.currentY = e.clientY;
  };

  private mouseMoveHandler = (e: MouseEvent): void => {
    e.preventDefault();

    if (this.currentX === null || this.currentY === null) return;

    if (this.drag) this.drag(e.clientX - this.currentX, e.clientY - this.currentY);

    this.currentX = e.clientX;
    this.currentY = e.clientY;
  };

  private mouseUpHandler = (e: MouseEvent): void => {
    e.preventDefault();
    this.mouseMoveHandler(e);

    this.currentX = null;
    this.currentY = null;
  };

  private clickHandler = (e: MouseEvent): void => {
    e.preventDefault();

    if (this.startX === null || this.startY === null) return;
    if (Math.abs(this.startX - e.clientX) > 3 || Math.abs(this.startY - e.clientY) > 3) return;

    if (this.click) this.click(e.clientX, e.clientY);

    this.startX = null;
    this.startY = null;
  };
}

export default Controls;
