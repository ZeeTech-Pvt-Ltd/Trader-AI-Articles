import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SITE } from '../../../../data/site.js'
import { listDropPosts, getDropPost } from '../../../../lib/drop-posts.js'
import '../../drop.css'

export const dynamicParams = false

export function generateStaticParams() {
  const posts = listDropPosts()
  // Next requires a non-empty list with dynamicParams=false only when params exist at all.
  return posts
}

const pathOf = (type, slug) => `/articles/${type}/${slug}`

export async function generateMetadata({ params }) {
  const { type, slug } = await params
  const post = getDropPost(type, slug)
  if (!post) return {}
  const title = post.seoTitle || post.title
  const url = `https://traderai.ai${pathOf(type, slug)}`
  const image = post.ogImage || `${SITE.url}og-image.png`
  return {
    title: { absolute: title },
    description: post.description,
    authors: post.author ? [{ name: post.author }] : undefined,
    alternates: { canonical: url },
    robots: 'index, follow',
    openGraph: { type: 'article', title, description: post.description, url, images: [image], publishedTime: post.date },
    twitter: { title, description: post.description, images: [image] },
  }
}

export default async function DropArticlePage({ params }) {
  const { type, slug } = await params
  const post = getDropPost(type, slug)
  if (!post) notFound()
  const date = post.date ? new Date(post.date).toISOString().slice(0, 10) : ''
  return (
    <>
      {post.reviewJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: String(post.reviewJsonLd).replace(/</g, '\\u003c') }} />
      )}
      <article className="drop-article">
        <div className="drop-article__crumb">
          <Link href="/">Home</Link> → {post.title}
        </div>
        <h1 className="drop-article__title">{post.title}</h1>
        <p className="drop-article__meta">
          {post.author ? `By ${post.author} · ` : ''}
          {date}
          {post.readingTime ? ` · ${post.readingTime}` : ''}
        </p>
        <div className="drop-article__body" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  )
}
