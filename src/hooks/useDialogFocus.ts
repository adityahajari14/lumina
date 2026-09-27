"use client";

import { useEffect, useRef, type RefObject } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scroll-lock';

const dialogs: symbol[] = [];
const selector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogFocus(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const element = ref.current;
    if (!open || !element) return;
    const token = Symbol('dialog');
    dialogs.push(token);
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const topmost = () => dialogs.at(-1) === token;
    const focusable = () => Array.from(element.querySelectorAll<HTMLElement>(selector))
      .filter(node => node.getClientRects().length > 0 && !node.closest('[inert], [hidden]'));
    const focusFirst = () => (focusable()[0] || element).focus();
    lockBodyScroll();
    focusFirst();
    const keydown = (event: KeyboardEvent) => {
      if (!topmost()) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes.at(-1);
      if (!first) { event.preventDefault(); element.focus(); }
      else if (event.shiftKey && (document.activeElement === first || !element.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !element.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    const focusin = (event: FocusEvent) => {
      if (topmost() && event.target instanceof Node && !element.contains(event.target)) focusFirst();
    };
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('focusin', focusin);
    return () => {
      dialogs.splice(dialogs.indexOf(token), 1);
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('focusin', focusin);
      unlockBodyScroll();
      if (previous?.isConnected) previous.focus();
    };
  }, [open, ref]);
}
