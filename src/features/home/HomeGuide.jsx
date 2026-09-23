import React from 'react'
import { Link } from '../../app/router'
import { pathFor } from '../../config/routes'
import { homeGuide } from '../../content/pages/home'
import { useI18n } from '../../i18n/LanguageProvider'

export default function HomeGuide() {
  const { language } = useI18n()
  const guide = homeGuide[language]
  const link = ([name, slug]) => pathFor(name, language, { slug })

  return (
    <div className="home-guide">
      <section className="guide-intro" aria-labelledby="guide-intro">
        <h2 id="guide-intro">{guide.intro.title}</h2>
        {guide.intro.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <div className="guide-columns">
        <section className="guide-block" aria-labelledby="guide-how">
          <h2 id="guide-how">{guide.howTo.title}</h2>
          <ol className="guide-steps">
            {guide.howTo.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Link className="guide-link" to={pathFor('howToPlay', language)}>
            {guide.howTo.more} →
          </Link>
        </section>

        <section className="guide-block" aria-labelledby="guide-modes">
          <h2 id="guide-modes">{guide.modes.title}</h2>
          {['normal', 'ranked'].map((mode) => (
            <article key={mode} className={`guide-mode guide-mode-${mode}`}>
              <h3>{guide.modes[mode].title}</h3>
              <p>{guide.modes[mode].copy}</p>
            </article>
          ))}
          <h3>{guide.scoring.title}</h3>
          <p>{guide.scoring.copy}</p>
          <Link className="guide-link" to={pathFor('ranking', language)}>
            {guide.scoring.more} →
          </Link>
        </section>
      </div>

      <section className="guide-topics" aria-labelledby="guide-topics">
        <h2 id="guide-topics">{guide.topics.title}</h2>
        <ul className="topic-cards">
          {guide.topics.items.map((item) => (
            <li key={item.title}>
              <article>
                <h3>
                  <Link to={link(item.page)}>{item.title}</Link>
                </h3>
                <p>{item.copy}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="guide-faq" aria-labelledby="guide-faq">
        <h2 id="guide-faq">{guide.faq.title}</h2>
        {guide.faq.items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
