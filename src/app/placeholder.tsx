import { Hammer } from 'lucide-react'
import { Card } from '@/components/patterns/card'

const FILE_KEY = 'H6SDkbXPzmF8l2DkDQmvB9'

/**
 * Stand-in for a screen that has a route but no component yet.
 * Names the Figma node so picking the screen up needs no doc lookup.
 */
export function Placeholder({ title, node, path }: { title: string; node?: string; path?: string }) {
  return (
    <Card className="mx-auto max-w-[560px]">
      <div className="grid place-items-center gap-3 p-12 text-center">
        <Hammer className="size-6 text-fg-muted" aria-hidden />
        <h1 className="text-card-title">{title}</h1>
        {path && <p className="text-fg-muted">{path}</p>}

        {node ? (
          <div className="mt-2 grid gap-1">
            <p className="text-eyebrow uppercase text-fg-muted">Figma node</p>
            <a
              className="text-link text-brand-700 hover:underline"
              href={`https://www.figma.com/design/${FILE_KEY}/uninexus?node-id=${node.replace(':', '-')}`}
              target="_blank"
              rel="noreferrer"
            >
              {node}
            </a>
          </div>
        ) : (
          <p className="max-w-[42ch] text-fg-muted">
            No Figma frame exists for this screen yet.
          </p>
        )}
      </div>
    </Card>
  )
}
