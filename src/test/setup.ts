// jsdom does not implement the Canvas `ImageData` constructor, which our pure
// pixel-math functions (and their tests) rely on. Provide a minimal polyfill.
if (typeof (globalThis as any).ImageData === 'undefined') {
  class ImageDataPolyfill {
    data: Uint8ClampedArray
    width: number
    height: number
    constructor(
      dataOrWidth: Uint8ClampedArray | number,
      widthOrHeight: number,
      height?: number
    ) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth
        this.width = widthOrHeight
        this.height = height ?? dataOrWidth.length / 4 / widthOrHeight
      } else {
        this.width = dataOrWidth
        this.height = widthOrHeight
        this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight * 4)
      }
    }
  }
  ;(globalThis as any).ImageData = ImageDataPolyfill
}
