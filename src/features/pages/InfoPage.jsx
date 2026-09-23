import React from 'react'
import Breadcrumbs from '../../components/content/Breadcrumbs'
import ContentSections from '../../components/content/ContentSections'
import PlayCallout from '../../components/content/PlayCallout'
import { pathFor } from '../../config/routes'
import { aboutContent } from '../../content/pages/about'
import { howToPlayContent } from '../../content/pages/howToPlay'
import { useI18n } from '../../i18n/LanguageProvider'

const CONTENT = { howToPlay: howToPlayContent, about: aboutContent }

// The "How to play" and "About" pages: a heading, a lede and editorial sections.
export default function InfoPage({ page }) {
  const { t, language } = useI18n()
  const content = CONTENT[page][language]

  return (
    <article className="page-card content-page">
      <Breadcrumbs
        items={[
          [t.home, pathFor('home', language)],
          [content.eyebrow, pathFor(page, language)],
        ]}
      />
      <header>
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="lede">{content.lede}</p>
      </header>
      <ContentSections sections={content.sections} />
      <PlayCallout />
    </article>
  )
}
