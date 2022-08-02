export interface SkyViewerGradientColorStop {
  /**
   *
   * Colour Hex Code:
   *
   */
  hex: string
  /**
   *
   * Gradient Stop:
   *
   */
  stop: number
}

export interface SkyViewerOptions {
  /**
   *
   * is the Sky Viewer live?
   * @default true
   *
   */
  live: boolean
  /**
   *
   * are keyboard controls enabled for the SkyViewer?
   * @default true
   *
   */
  controls?: boolean
  /**
   * 
   * are mouse and gesture interactions enabled for the SkyViewer?
   * 
   */
  interactions?: boolean
  /**
   *
   * is the Sky Viewer showing stars?
   * @default true
   *
   */
  showStars: boolean
  /**
   *
   * is the Sky Viewer showing constellations?
   * @default true
   *
   */
  showConstellations: boolean
  /**
   *
   * is the Sky Viewer showing the Sun?
   * @default true
   *
   */
  showSun: boolean
  /**
   *
   * is the Sky Viewer showing the Moon?
   * @default true
   *
   */
  showMoon: boolean
  /**
   *
   * is the Sky Viewer showing the ecliptic?
   * @default true
   *
   */
  showEcliptic: boolean
  /**
   *
   * is the Sky Viewer showing cardinals?
   * @default true
   *
   */
  showCardinalPoints: boolean
  /**
   *
   * The background gradient to be applied to the Sky Viewer:
   *
   */
  gradient: SkyViewerGradientColorStop[]
}

export interface SkyViewerPosition {
  /**
   *
   * How many pixels are we from the left of the SkyViewer
   *
   */
  left: number
  /**
   *
   * How many pixels are we from the right of the SkyViewer
   *
   */
  right: number
  /**
   *
   * How many pixels are we from the top of the SkyViewer
   *
   */
  top: number
  /**
   *
   * How many pixels are we from the bottom of the SkyViewer
   *
   */
  bottom: number
}
