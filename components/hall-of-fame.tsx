import Link from "next/link"

export default function HallOfFame() {
  const topCoders = [
    { rank: 1, name: "CodeMaster99", title: "Grandmaster", rating: 2450, avatar: "https://i.pravatar.cc/150?img=1" },
    { rank: 2, name: "AlgoQueen", title: "Master", rating: 2310, avatar: "https://i.pravatar.cc/150?img=2" },
    { rank: 3, name: "ByteWizard", title: "Candidate Master", rating: 2195, avatar: "https://i.pravatar.cc/150?img=3" },
  ]

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "bg-yellow-300"
    if (rank === 2) return "bg-gray-300"
    return "bg-orange-200"
  }

  const getTitleColor = (title) => {
    if (title === "Grandmaster") return "text-orange-500"
    if (title === "Master") return "text-red-500"
    return "text-purple-500"
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 bg-gray-50">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-gray-900 mb-2">Hall of Fame</h2>
        <p className="text-gray-600 text-lg">Top rated coders this month</p>
      </div>

      {/* Leaderboard Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        {/* Table Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-20">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Rank</span>
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">User</span>
          </div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Rating</span>
        </div>

        <div className="space-y-6">
          {topCoders.map((coder, index) => (
            <div
              key={coder.rank}
              className={`flex items-center justify-between transition-colors hover:bg-gray-50 p-2 rounded-lg ${
                index !== topCoders.length - 1 ? "pb-6 border-b border-gray-200" : ""
              }`}
            >
              <div className="flex items-center gap-6">
                {/* Rank Badge */}
                <div
                  className={`w-10 h-10 rounded-full ${getRankBadgeColor(coder.rank)} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="font-bold text-gray-900 text-base">{coder.rank}</span>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={coder.avatar || "/placeholder.svg"}
                    alt={coder.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{coder.name}</p>
                    <p className={`text-sm font-medium ${getTitleColor(coder.title)}`}>{coder.title}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <p className="font-bold text-gray-900 text-lg">{coder.rating}</p>
            </div>
          ))}
        </div>
      </div>

      {/* View Full Leaderboard Link */}
      <div className="text-center">
        <Link
          href="/leaderboard"
          className="inline-flex items-center text-gray-600 font-medium hover:text-gray-900 transition-colors group"
        >
          View Full Leaderboard
          <span className="ml-2 group-hover:translate-y-1 transition-transform">↓</span>
        </Link>
      </div>
    </section>
  )
}
