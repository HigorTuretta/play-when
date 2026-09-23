import React from 'react'

// Renders editorial sections ({ title, paragraphs, steps, list, table }) as semantic HTML:
// each section is a <section> with an <h2>.
export default function ContentSections({ sections, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`
  return sections.map((section) => (
    <section key={section.title} className="content-section">
      <Heading>{section.title}</Heading>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.steps && (
        <ol className="content-steps">
          {section.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      {section.list && (
        <ul className="content-list">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.table && (
        <table className="content-table">
          <thead>
            <tr>
              {section.table.headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.table.rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  ))
}
