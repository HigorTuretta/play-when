// Same behaviour as arrayMove from @dnd-kit/sortable, without pulling the drag-and-drop
// library into the bundle that every page loads.
export function arrayMove(items, from, to) {
  const next = [...items]
  next.splice(to < 0 ? next.length + to : to, 0, next.splice(from, 1)[0])
  return next
}
