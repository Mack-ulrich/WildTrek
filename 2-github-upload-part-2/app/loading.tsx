import { Spinner } from "@/spinner"

export default function Loading() {
  return (
    <div className="py-32 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
