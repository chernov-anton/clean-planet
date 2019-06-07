interface MouseButtonListener {
  (x: number, y: number): void;
}

interface Zoom {
  (): void;
}

type Coordinate = number | null;

class Controls {
  private startDragX: Coordinate;
  private startDragY: Coordinate;
  private drag: MouseButtonListener;
  private click: MouseButtonListener;
  private zoomIn: Zoom;
  private zoomOut: Zoom;

  public constructor(
    domObject: HTMLElement,
    drag: MouseButtonListener,
    click: MouseButtonListener,
    zoomIn: Zoom,
    zoomOut: Zoom
  ) {
    this.startDragX = null;
    this.startDragY = null;
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
    this.startDragX = e.clientX;
    this.startDragY = e.clientY;
  };

  private mouseMoveHandler = (e: MouseEvent): void => {
    e.preventDefault();
    if (this.startDragX === null || this.startDragY === null) return;

    if (this.drag) this.drag(e.clientX - this.startDragX, e.clientY - this.startDragY);

    this.startDragX = e.clientX;
    this.startDragY = e.clientY;
  };

  private mouseUpHandler = (e: MouseEvent): void => {
    e.preventDefault();
    this.mouseMoveHandler(e);
    this.startDragX = null;
    this.startDragY = null;
  };
  private clickHandler = (e: MouseEvent): void => {
    e.preventDefault();
    debugger;

    /* if (this.startDragX === null || this.startDragY === null) return;
    if (Math.abs(this.startDragX - e.clientX) > 3 || Math.abs(this.startDragY - e.clientY) > 3)
      return;*/

    if (this.click) this.click(e.clientX, e.clientY);

    this.startDragX = null;
    this.startDragY = null;
  };
}

export default Controls;
