import React from 'react'
import { Link } from '../../app/router'
import Breadcrumbs from '../../components/content/Breadcrumbs'
import PlayCallout from '../../components/content/PlayCallout'
import { pathFor } from '../../config/routes'
import { factsForTopic, loadedFacts, publishedTopics } from '../../content/facts/store'
import { historyContent } from '../../content/pages/history'
import { useI18n } from '../../i18n/LanguageProvider'
import FactCard from './FactCard'

// /historia and /history: every published topic, then every fact page in date order.
export default function HistoryPage() {
  const { t, language } = useI18n()
  const content = historyContent[language]

  return (
    <article className="page-card content-page history-page">
      <Breadcrumbs
        items={[
          [t.home, pathFor('home', language)],
          [t.nav.history, pathFor('history', language)],
        ]}
      />
      <header>
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="lede">{content.lede}</p>
      </header>

      <section className="content-section">
        <h2>{content.topicsTitle}</h2>
        <ul className="topic-grid">
          {publishedTopics().map((topic) => (
            <li key={topic.id}>
              <Link to={pathFor('topic', language, { slug: topic.slug[language] })}>
                <strong>{topic[language].name}</strong>
                <span>{content.factsCount(factsForTopic(topic.id).length)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="content-section">
        <h2>{content.timelineTitle}</h2>
        <div className="fact-grid fact-timeline">
          {loadedFacts().map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>
      </section>

      <PlayCallout />
    </article>
  )
}
