import { Ref } from '../types/form';

export default function isDetached(element: Ref): boolean {
  if (!element) {
    return true;
  }

  if (
    !(element instanceof HTMLElement) ||
    element.nodeType === Node.DOCUMENT_NODE
  ) {
    return false;
  }

  return isDetached(element.parentNode as Ref);
}
