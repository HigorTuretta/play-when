import React from 'react'
import { Link } from '../../app/router'
import Breadcrumbs from '../../components/content/Breadcrumbs'
import PlayCallout from '../../components/content/PlayCallout'
import { pathFor } from '../../config/routes'
import { factById, factBySlug } from '../../content/facts/store'
import { topicById } from '../../content/topics'
import { useI18n } from '../../i18n/LanguageProvider'
import NotFoundPage from '../pages/NotFoundPage'
import FactCard from './FactCard'

// An editorial page about one historical event. It is written by hand (see
// src/content/facts) and never names the game's rounds or card ids.
export default function FactPage({ slug }) {
  const { t, language } = useI18n()
  const fact = factBySlug(slug, language)
  if (!fact) return <NotFoundPage />

  const text = fact[language]
  const topics = fact.topics.map(topicById)
  const related = fact.related.map(factById).filter(Boolean)
  const primary = topics[0]

  return (
    <article className="page-card content-page fact-page">
      <Breadcrumbs
        items={[
          [t.home, pathFor('home', language)],
          [t.nav.history, pathFor('history', language)],
          [primary[language].name, pathFor('topic', language, { slug: primary.slug[language] })],
          [text.title, pathFor('fact', language, { slug })],
        ]}
      />
      <header>
        <p className="eyebrow">{primary[language].name}</p>
        <h1>{text.title}</h1>
        <dl className="fact-meta">
          <div>
            <dt>{t.fact.date}</dt>
            <dd>
              <time dateTime={fact.date.iso}>{text.dateLabel}</time>
            </dd>
          </div>
          <div>
            <dt>{t.fact.topics}</dt>
            <dd>
              {topics.map((topic, index) => (
                <React.Fragment key={topic.id}>
                  {index > 0 && ', '}
                  <Link to={pathFor('topic', language, { slug: topic.slug[language] })}>
                    {topic[language].name}
                  </Link>
                </React.Fragment>
              ))}
            </dd>
          </div>
        </dl>
      </header>

      <section className="content-section">
        <h2>{t.fact.summary}</h2>
        <p className="fact-summary">{text.summary}</p>
      </section>
      <section className="content-section">
        <h2>{t.fact.context}</h2>
        {text.context.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      <section className="content-section">
        <h2>{t.fact.relevance}</h2>
        {text.relevance.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <PlayCallout />

      {related.length > 0 && (
        <section className="content-section">
          <h2>{t.fact.related}</h2>
          <div className="fact-grid">
            {related.map((item) => (
              <FactCard key={item.id} fact={item} />
            ))}
          </div>
        </section>
      )}

      <section className="content-section fact-sources">
        <h2>{t.fact.sources}</h2>
        <ul>
          {fact.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
