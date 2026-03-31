import { useRef, useCallback } from "react";

export function useDragScroll() {
  const ref = useRef(null);
  const state = useRef({ dragging: false, x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();

    const el = ref.current;
    state.current = {
      dragging: true,
      x: e.clientX,
      y: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    el.style.cursor = "grabbing";

    function onMouseMove(e) {
      if (!state.current.dragging) return;
      el.scrollLeft = state.current.scrollLeft - (e.clientX - state.current.x);
      el.scrollTop  = state.current.scrollTop  - (e.clientY - state.current.y);
    }

    function onMouseUp() {
      state.current.dragging = false;
      el.style.cursor = "grab";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  return { ref, onMouseDown };
}
