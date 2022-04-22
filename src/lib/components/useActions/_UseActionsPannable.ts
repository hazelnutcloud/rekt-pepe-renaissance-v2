import { cubicOut } from 'svelte/easing';
import { tweened } from 'svelte/motion';
import TinyGesture from 'tinygesture';

export default function Pannable(node: HTMLElement) {
  const gesture = new TinyGesture(node);
  let animationFrame = null;

  const top = tweened(0, {
    duration: 160,
    easing: cubicOut,
  });

  const topUnsub = top.subscribe((value) => {
    node.style.top = `${value}px`;
  });

  node.style.transition =
    (node.style.transition ? node.style.transition + ', ' : '') +
    'opacity ease .3s';

  node.addEventListener('touchstart', { passive: false });

  gesture.on('panmove', () => {
    if (animationFrame) {
      return;
    }
    animationFrame = window.requestAnimationFrame(() => {
      if (!gesture.swipingDirection.startsWith('pre-')) {
        node.style.opacity = '0.6';
      } else {
        node.style.opacity = '1';
      }
      node.style.transform =
        'translateY(' + (gesture.touchMoveY / 8) + 'px)';
      top.set(gesture.touchMoveY, { duration: 0 });

      animationFrame = null;
    });
  });

  gesture.on('panend', () => {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    node.style.transform = null;
    top.set(0);
    node.style.opacity = '1';
  });

  return {
    destroy() {
      node.removeEventListener('touchstart', preventDefault, {
        passive: false,
      } as EventListenerOptions);
      window.cancelAnimationFrame(animationFrame);
      topUnsub();
      gesture.destroy();
    },
  };
}
