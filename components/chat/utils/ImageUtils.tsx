import { setImageData } from '@/redux/slices/imageSlice'

export default class ImageUtils {
  static dispatch: Function | null = null

  static initialize(newDispatch: Function) {
    ImageUtils.dispatch = newDispatch
  }

  static addImage(requestId: string | null, imageUrl: string) {
    if (!ImageUtils.dispatch) {
      throw new Error(
        'Dispatch is not initialized. Call MessageOptionUtils.initialize() first.'
      )
    }
    ImageUtils.dispatch(setImageData({ requestId: requestId, url: imageUrl }))
  }
}
