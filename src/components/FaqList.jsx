import { useState } from 'react'

export default function FaqList({ items }) {
  const [open, setOpen] = useState(0)

  return (
    <div className="faq">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div className={`faq__item ${isOpen ? 'is-open' : ''}`} key={i}>
            <button
              type="button"
              className="faq__q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              {item.q}
              <span className="faq__icon" aria-hidden="true">+</span>
            </button>
            <div className="faq__a" style={{ maxHeight: isOpen ? '600px' : '0px' }}>
              <p className="faq__a-inner">{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
