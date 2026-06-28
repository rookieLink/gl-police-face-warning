declare namespace BMap {
  class Map {
    constructor(container: HTMLElement);
    centerAndZoom(point: Point, zoom: number): void;
    enableScrollWheelZoom(enable: boolean): void;
    addControl(control: NavigationControl | ScaleControl): void;
    addOverlay(overlay: Marker): void;
    openInfoWindow(infoWindow: InfoWindow, point: Point): void;
    destroy(): void;
  }

  class Point {
    constructor(lng: number, lat: number);
  }

  class Marker {
    constructor(point: Point);
    addEventListener(event: string, handler: () => void): void;
  }

  class InfoWindow {
    constructor(content: string, options?: { width?: number; height?: number; title?: string });
  }

  class NavigationControl {
    constructor();
  }

  class ScaleControl {
    constructor();
  }
}
