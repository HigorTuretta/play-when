import React from 'react'
import { Link } from '../../app/router'
import { pathFor } from '../../config/routes'
import { useI18n } from '../../i18n/LanguageProvider'

export default function FactCard({ fact, headingLevel = 3 }) {
  const { language } = useI18n()
  const text = fact[language]
  const Heading = `h${headingLevel}`

  return (
    <article className="fact-card">
      <p className="fact-card-date">
        <time dateTime={fact.date.iso}>{text.dateLabel}</time>
      </p>
      <Heading>
        <Link to={pathFor('fact', language, { slug: fact.slug[language] })}>{text.title}</Link>
      </Heading>
      <p>{text.description}</p>
    </article>
  )
}
