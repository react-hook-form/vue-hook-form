import { Ref, MutationWatcher } from '../types/form';
import isDetached from './isDetached';

export default function onDomRemove(
  element: Ref,
  onDetachCallback: VoidFunction,
): MutationWatcher {
  const observer = new MutationObserver((): void => {
    if (isDetached(element)) {
      observer.disconnect();
      onDetachCallback();
    }
  });

  observer.observe(window.document, {
    childList: true,
    subtree: true,
  });

  return observer;
}
