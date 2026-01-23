import Header from "@/components/header"
import ContestsContent from "@/components/contests-content"

export const metadata = {
  title: "Contests | UCP Arena",
  description: "Join coding contests and compete with others.",
}

export default function ContestsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <ContestsContent />
      </main>
    </div>
  )
}
