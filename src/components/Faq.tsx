import { useState } from 'react'
import './faq.css'

export type FaqItem = { q: string; a: string }

/**
 * Question-and-answer accordion. One item open at a time; the first is open on
 * first render so the pre-rendered HTML ships with a visible answer.
 *
 * Every answer stays in the DOM whether or not its item is open — collapsing is
 * done by animating a grid track to 0fr, not by unmounting — which is what lets
 * the FAQPage markup mirror the page: answer engines and crawlers read the text
 * regardless of the open item, and the <noscript> rule below expands all of them
 * for a visitor whose JavaScript never runs.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="faq">
      <noscript
        dangerouslySetInnerHTML={{ __html: '<style>.faq__a{grid-template-rows:1fr}</style>' }}
      />
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <article className={`faq__item${isOpen ? ' is-open' : ''}`} key={item.q}>
            <h3 className="faq__q">
              <button
                type="button"
                className="faq__btn"
                id={`faq-q-${i}`}
                aria-controls={`faq-a-${i}`}
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <svg
                  className="faq__icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div
              className="faq__a"
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
            >
              <div className="faq__a-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
