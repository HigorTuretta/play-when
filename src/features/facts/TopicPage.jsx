import React from 'react'
import { Link } from '../../app/router'
import Breadcrumbs from '../../components/content/Breadcrumbs'
import PlayCallout from '../../components/content/PlayCallout'
import { pathFor } from '../../config/routes'
import { factsForTopic, publishedTopics } from '../../content/facts/store'
import { topicBySlug } from '../../content/topics'
import { useI18n } from '../../i18n/LanguageProvider'
import NotFoundPage from '../pages/NotFoundPage'
import FactCard from './FactCard'

export default function TopicPage({ slug }) {
  const { t, language } = useI18n()
  const topic = topicBySlug(slug, language)
  const facts = topic ? factsForTopic(topic.id) : []
  // Topics without facts are not published (see publishedTopics).
  if (!topic || !facts.length) return <NotFoundPage />

  const text = topic[language]
  const others = publishedTopics().filter((item) => item.id !== topic.id)

  return (
    <article className="page-card content-page topic-page">
      <Breadcrumbs
        items={[
          [t.home, pathFor('home', language)],
          [t.nav.history, pathFor('history', language)],
          [text.name, pathFor('topic', language, { slug })],
        ]}
      />
      <header>
        <p className="eyebrow">{t.topic.eyebrow}</p>
        <h1>{text.title}</h1>
        {text.intro.map((paragraph) => (
          <p key={paragraph} className="lede">
            {paragraph}
          </p>
        ))}
      </header>

      <section className="content-section">
        <h2>{t.topic.facts}</h2>
        <div className="fact-grid">
          {facts.map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>
      </section>

      <PlayCallout />

      {others.length > 0 && (
        <nav className="content-section" aria-labelledby="other-topics">
          <h2 id="other-topics">{t.topic.otherTopics}</h2>
          <ul className="topic-pills">
            {others.map((other) => (
              <li key={other.id}>
                <Link to={pathFor('topic', language, { slug: other.slug[language] })}>
                  {other[language].name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  )
}
