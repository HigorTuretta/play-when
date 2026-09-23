import React from 'react'
import { Link } from '../../app/router'
import { useI18n } from '../../i18n/LanguageProvider'

// items: [label, path] pairs; the last one is the current page and is not a link.
export default function Breadcrumbs({ items }) {
  const { t } = useI18n()
  return (
    <nav className="breadcrumbs" aria-label={t.breadcrumb}>
      <ol>
        {items.map(([label, path], index) => (
          <li key={path}>
            {index < items.length - 1 ? (
              <Link to={path}>{label}</Link>
            ) : (
              <span aria-current="page">{label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
