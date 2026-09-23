import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  TouchSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useI18n } from '../../../i18n/LanguageProvider'
import { useDustBurst } from '../hooks/useDustBurst'
import CardContent from './CardContent'
import DustBurst from './DustBurst'
import SortableCard from './SortableCard'
import TimelineRail from './TimelineRail'

const MEASURING = { droppable: { strategy: MeasuringStrategy.BeforeDragging } }

const DROP_ANIMATION = {
  duration: 300,
  easing: 'cubic-bezier(.2,.9,.25,1)',
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.15' } } }),
}

export default function CardBoard({ cards, reveal, locked, onMove, onReorder }) {
  const { t } = useI18n()
  const [dragging, setDragging] = useState(null)
  const { burst, trigger } = useDustBurst()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 90, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const draggedCard = dragging ? cards.find((card) => card.id === dragging.id) : null

  const handleMove = (from, to) => {
    if (locked) return
    onMove(from, to)
    trigger(cards[from]?.id)
  }

  const handleDragStart = ({ active }) => {
    if (locked) return
    setDragging({ id: active.id, width: active.rect.current.initial?.width })
  }

  const handleDragEnd = ({ active, over }) => {
    setDragging(null)
    if (locked || !over) return
    onReorder(active.id, over.id)
    trigger(active.id, over.rect)
  }

  return (
    <DndContext
      sensors={sensors}
      measuring={MEASURING}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={() => setDragging(null)}
      onDragEnd={handleDragEnd}
    >
      <section
        className={`timeline-zone ${dragging ? 'is-sorting' : ''} ${locked && !reveal ? 'is-locked' : ''}`}
        aria-label={t.cardsAria}
      >
        <SortableContext items={cards.map((card) => card.id)} strategy={rectSortingStrategy}>
          <div className="cards-grid">
            {cards.map((card, index) => (
              <SortableCard
                key={card.id}
                card={card}
                index={index}
                count={cards.length}
                reveal={reveal}
                locked={locked}
                onMove={handleMove}
              />
            ))}
          </div>
        </SortableContext>
        <TimelineRail />
      </section>
      <DragOverlay adjustScale={false} dropAnimation={DROP_ANIMATION}>
        {draggedCard && (
          <article className="timeline-card drag-overlay-card" style={{ width: dragging.width }}>
            <CardContent card={draggedCard} />
          </article>
        )}
      </DragOverlay>
      <DustBurst burst={burst} />
    </DndContext>
  )
}
