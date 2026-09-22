import React from 'react'
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CardContent from './CardContent'

const SORT_TRANSITION = { duration: 340, easing: 'cubic-bezier(.22,1,.36,1)' }
const DEAL_STAGGER_MS = 70

const animateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true })

export default function SortableCard({ card, index, count, reveal, onMove }) {
  const revealed = Boolean(reveal)
  const correctIndex = revealed ? reveal.correctOrder.indexOf(card.id) : -1
  const status = !revealed ? '' : correctIndex === index ? 'correct' : 'wrong'

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: revealed,
    animateLayoutChanges,
    transition: SORT_TRANSITION,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    '--deal-delay': `${index * DEAL_STAGGER_MS}ms`,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      data-card-id={card.id}
      className={`timeline-card ${status} ${isDragging ? 'is-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent
        card={card}
        revealed={revealed}
        status={status}
        correctPosition={correctIndex + 1}
        onMoveLeft={index > 0 ? () => onMove(index, index - 1) : undefined}
        onMoveRight={index < count - 1 ? () => onMove(index, index + 1) : undefined}
      />
    </article>
  )
}
