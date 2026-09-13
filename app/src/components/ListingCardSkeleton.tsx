import Skeleton from "@mui/material/Skeleton";

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton
          variant="text"
          width="50%"
          sx={{ fontSize: "1.125rem", bgcolor: "var(--skeleton)" }}
        />
        <Skeleton
          variant="rounded"
          width={56}
          height={20}
          sx={{ bgcolor: "var(--skeleton)" }}
        />
      </div>
      <Skeleton variant="text" width="40%" sx={{ bgcolor: "var(--skeleton)" }} />
      <Skeleton variant="text" width="70%" sx={{ bgcolor: "var(--skeleton)" }} />
    </div>
  );
}
