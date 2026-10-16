import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ChevronLeft } from "lucide-react"
import { ARTICLES, ARTICLE_BY_SLUG } from "@/data/articles"
import { Chip } from "@/components/bits"

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = ARTICLE_BY_SLUG[(await params).slug]
  return a ? { title: a.title, description: a.excerpt } : {}
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = ARTICLE_BY_SLUG[(await params).slug]
  if (!a) notFound()
  const more = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3)

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/cave" className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900"><ChevronLeft className="h-4 w-4" />The Cave</Link>
      <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">{a.category}</p>
      <h1 className="mt-2 text-4xl font-bold leading-[1.05] md:text-5xl">{a.title}</h1>
      <p className="mt-4 text-lg text-stone-600">{a.excerpt}</p>
      <p className="mt-6 border-y border-stone-200 py-3 text-sm text-stone-500">
        <span className="font-semibold text-stone-800">{a.author}</span> · {a.authorRole} · {new Date(a.date + "T12:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {a.readMinutes} min read
      </p>
      <div className="mt-8 space-y-6 text-[17px] leading-relaxed text-stone-800">
        {a.body.map((b, i) => (
          <div key={i}>
            {b.heading && <h2 className="mb-2 text-2xl font-bold text-stone-900">{b.heading}</h2>}
            <p>{b.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">{a.tags.map((t) => <Chip key={t}>#{t}</Chip>)}</div>

      <div className="mt-14 border-t border-stone-200 pt-8">
        <h2 className="mb-4 text-2xl font-bold">Keep reading</h2>
        <div className="space-y-3">
          {more.map((m) => (
            <Link key={m.slug} href={`/cave/${m.slug}`} className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-700">
              <p className="text-xs font-semibold uppercase text-orange-700">{m.category}</p>
              <p className="font-display text-xl font-bold">{m.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}
