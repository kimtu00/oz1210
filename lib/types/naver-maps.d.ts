/**
 * @file naver-maps.d.ts
 * @description 네이버 지도 API 타입 정의
 *
 * Naver Maps JavaScript API v3 (NCP) 타입 정의
 * 공식 문서: https://navermaps.github.io/maps.js.ncp/docs/
 */

declare global {
  interface Window {
    naver: typeof naver;
  }
}

declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement | string, options?: MapOptions);
    setCenter(latlng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    getZoom(): number;
    panTo(latlng: LatLng | LatLngLiteral): void;
    fitBounds(bounds: LatLngBounds): void;
    setMapTypeId(mapTypeId: MapTypeId): void;
    refreshSize(): void;
    destroy(): void;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    mapTypeId?: MapTypeId;
    mapTypeControl?: boolean;
    mapTypeControlOptions?: MapTypeControlOptions;
    zoomControl?: boolean;
    zoomControlOptions?: ZoomControlOptions;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(latlng: LatLng | LatLngLiteral): void;
    getSW(): LatLng;
    getNE(): LatLng;
    isEmpty(): boolean;
  }

  enum MapTypeId {
    NORMAL = "normal",
    SATELLITE = "satellite",
    HYBRID = "hybrid",
  }

  interface MapTypeControlOptions {
    position?: Position;
    style?: MapTypeControlStyle;
  }

  interface ZoomControlOptions {
    position?: Position;
  }

  enum Position {
    TOP_LEFT = "TOP_LEFT",
    TOP_CENTER = "TOP_CENTER",
    TOP_RIGHT = "TOP_RIGHT",
    LEFT_CENTER = "LEFT_CENTER",
    RIGHT_CENTER = "RIGHT_CENTER",
    BOTTOM_LEFT = "BOTTOM_LEFT",
    BOTTOM_CENTER = "BOTTOM_CENTER",
    BOTTOM_RIGHT = "BOTTOM_RIGHT",
  }

  enum MapTypeControlStyle {
    BUTTON = "button",
    DROPDOWN = "dropdown",
  }

  class Marker {
    constructor(options: MarkerOptions);
    setPosition(latlng: LatLng | LatLngLiteral): void;
    getPosition(): LatLng;
    setMap(map: Map | null): void;
    setIcon(icon: Icon | IconLiteral): void;
    setZIndex(zIndex: number): void;
    setVisible(visible: boolean): void;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    icon?: Icon | IconLiteral;
    title?: string;
    zIndex?: number;
    visible?: boolean;
    clickable?: boolean;
    draggable?: boolean;
  }

  interface Icon {
    url: string;
    size?: Size;
    scaledSize?: Size;
    origin?: Point;
    anchor?: Point;
  }

  interface IconLiteral {
    url: string;
    size?: SizeLiteral;
    scaledSize?: SizeLiteral;
    origin?: PointLiteral;
    anchor?: PointLiteral;
  }

  class Size {
    constructor(width: number, height: number);
    width(): number;
    height(): number;
  }

  interface SizeLiteral {
    width: number;
    height: number;
  }

  class Point {
    constructor(x: number, y: number);
    x(): number;
    y(): number;
  }

  interface PointLiteral {
    x: number;
    y: number;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    setContent(content: string | HTMLElement): void;
    open(map: Map, marker?: Marker): void;
    close(): void;
    getMap(): Map | null;
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement;
    maxWidth?: number;
    pixelOffset?: Size | SizeLiteral;
    position?: LatLng | LatLngLiteral;
    zIndex?: number;
  }

  class Event {
    static addListener(
      instance: Map | Marker | InfoWindow,
      eventName: string,
      handler: Function
    ): void;
    static removeListener(
      instance: Map | Marker | InfoWindow,
      eventName: string,
      handler: Function
    ): void;
    static clearListeners(
      instance: Map | Marker | InfoWindow,
      eventName: string
    ): void;
  }
}

export {};


