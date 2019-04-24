interface Drag {
  (x: number, y: number): void;
}

interface Zoom {
  (): void;
}

type Coordinate = number | null;

class Controls {
  private startDragX: Coordinate;
  private startDragY: Coordinate;
  private drag: Drag;
  private zoomIn: Zoom;
  private zoomOut: Zoom;

  public constructor(domObject: HTMLElement, drag: Drag, zoomIn: Zoom, zoomOut: Zoom) {
    this.startDragX = null;
    this.startDragY = null;
    this.drag = drag;
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;

    domObject.addEventListener('wheel', this.mouseWheelHandler);
    domObject.addEventListener('wheel', this.mouseWheelHandler);
    domObject.addEventListener('mousedown', this.mouseDownHandler);
    domObject.addEventListener('mousemove', this.mouseMoveHandler);
    domObject.addEventListener('mouseup', this.mouseUpHandler);
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
}

export default Controls;
