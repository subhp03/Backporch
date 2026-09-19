export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-lg bg-zinc-900 px-4 py-3">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" />
    </div>
  );
}
