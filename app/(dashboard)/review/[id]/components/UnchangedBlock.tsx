import React, { useState } from "react"

export function UnchangedBlock({
  content,
  onChange,
}: {
  content: string
  onChange: (val: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const lines = content.split("\n")

  if (lines.length <= 8 || expanded) {
    return (
      <textarea
        className="
          w-full resize-y bg-transparent p-2 font-mono text-sm
          text-tech-main-dark/70 outline-none
          focus:bg-tech-main/5
        "
        rows={Math.max(2, lines.length + 1)}
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  const head = lines.slice(0, 3).join("\n")
  const tail = lines.slice(-3).join("\n")
  const hiddenCount = lines.length - 6

  return (
    <div className="
      flex flex-col border-y border-dashed border-tech-main/20 bg-tech-main/5
      font-mono text-sm text-tech-main-dark/60
    ">
      <pre className="bg-transparent p-2 whitespace-pre-wrap">{head}</pre>
      <div
        className="
          mx-4 my-1 cursor-pointer rounded-sm bg-tech-main/10 px-4 py-2
          text-center text-xs font-bold tracking-widest text-tech-main uppercase
          transition-colors
          hover:bg-tech-main/20
        "
        onClick={() => setExpanded(true)}
      >
        ? {hiddenCount} unchanged lines hidden. Expand to view/edit
      </div>
      <pre className="bg-transparent p-2 whitespace-pre-wrap">{tail}</pre>
    </div>
  )
}
