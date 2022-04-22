import TinyGesture from 'tinygesture';
import { shouldShowActions } from '../../../stores.js';

export default function Swipeable(node: HTMLElement) {
    const options = {
        velocityThreshold: 5,
    };
  const gesture = new TinyGesture(node, options);

  node.style.transition =
    (node.style.transition ? node.style.transition + ', ' : '') +
    'transform ease 0.3s';

  node.addEventListener('touchstart', { passive: false });

  shouldShowActions.subscribe((value: boolean )=> {
        if(!value) return;

        node.style.transform = '';
    });
    
  gesture.on('swiperight', () => {
    node.style.transform = 'perspective(1000px) translate3d(100%, 0, 0)';
      shouldShowActions.set(false);
  });
  gesture.on('swipeleft', () => {
    node.style.transform = 'perspective(1000px) translate3d(-100%, 0, 0)';
      shouldShowActions.set(false);
  });
  gesture.on('swipeup', () => {
    node.style.transform = 'perspective(1000px) translate3d(0, 100%, 0)';
      shouldShowActions.set(false);
  });
  gesture.on('swipedown', () => {
    node.style.transform = 'perspective(1000px) translate3d(0, 100%, 0)';
    shouldShowActions.set(false);

  });

  return {
    destroy() {
      node.removeEventListener('touchstart', preventDefault, {
        passive: false,
      } as EventListenerOptions);
      gesture.destroy();
    },
  };
}
