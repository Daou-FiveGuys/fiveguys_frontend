import { setContent, setPrompt } from '@/redux/slices/messageOptionSlice'

export default class MessageOptionUtils {
  static dispatch: Function | null = null

  static initialize(newDispatch: Function) {
    MessageOptionUtils.dispatch = newDispatch
  }

  static addContent(value: string | null) {
    if (!MessageOptionUtils.dispatch) {
      throw new Error(
        'Dispatch is not initialized. Call MessageOptionUtils.initialize() first.'
      )
    }
    MessageOptionUtils.dispatch(setContent(value))
  }

  static addPrompt(value: string | null) {
    if (!MessageOptionUtils.dispatch) {
      throw new Error(
        'Dispatch is not initialized. Call MessageOptionUtils.initialize() first.'
      )
    }
    MessageOptionUtils.dispatch(setPrompt(value))
  }
}
