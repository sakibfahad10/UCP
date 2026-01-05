"use client"

import { useState } from "react"
import { Search, Filter, TrendingUp } from "lucide-react"

export default function LeaderboardContent() {
  const [timeFilter, setTimeFilter] = useState("all-time")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rank")
  const [activeTab, setActiveTab] = useState("global")

  const topPerformers = [
    {
      rank: 1,
      username: "@AlgoQueen",
      title: "User Rank",
      score: 3500,
      contests: 18,
      color: "bg-gradient-to-br from-orange-400 to-orange-500",
      icon: "👑",
    },
    {
      rank: 2,
      username: "@CodeMaster99",
      title: "Gold Champion",
      score: 3500,
      contests: 12,
      color: "bg-gradient-to-br from-yellow-300 to-yellow-500",
      icon: "🏆",
    },
    {
      rank: 3,
      username: "@ByteWizard",
      title: "Bronze Rank",
      score: 3100,
      contests: 9,
      color: "bg-gradient-to-br from-orange-600 to-orange-700",
      icon: "⭐",
    },
  ]

  const leaderboardData = [
    {
      rank: 4,
      username: "@ByteWiz",
      verified: true,
      totalScore: 2100,
      solved: 134,
      contests: 38,
      winRate: "67%",
      bestRank: 1,
    },
    {
      rank: 5,
      username: "@CodeNinja",
      verified: false,
      totalScore: 1950,
      solved: 128,
      contests: 35,
      winRate: "65%",
      bestRank: 2,
    },
    {
      rank: 6,
      username: "@DebugMaster",
      verified: true,
      totalScore: 1850,
      solved: 122,
      contests: 32,
      winRate: "62%",
      bestRank: 3,
    },
    {
      rank: 7,
      username: "@AlgorithmPro",
      verified: true,
      totalScore: 1750,
      solved: 115,
      contests: 30,
      winRate: "60%",
      bestRank: 5,
    },
    {
      rank: 8,
      username: "@DataStructure",
      verified: false,
      totalScore: 1650,
      solved: 108,
      contests: 28,
      winRate: "58%",
      bestRank: 4,
    },
  ]

  const filteredData = leaderboardData.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.totalScore - a.totalScore
      case "solved":
        return b.solved - a.solved
      case "contests":
        return b.contests - a.contests
      default:
        return a.rank - b.rank
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-orange-500" />
          <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
        </div>
        <p className="text-gray-600 text-lg">Top performers across all contests and challenges.</p>
      </div>

      {/* Tabs for Global Leaderboard and Running Contests */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("global")}
          className={`px-6 py-4 font-semibold transition-colors ${
            activeTab === "global"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Global Leaderboard
        </button>
        <button
          onClick={() => setActiveTab("running")}
          className={`px-6 py-4 font-semibold transition-colors ${
            activeTab === "running"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Running Contests
        </button>
      </div>

      {activeTab === "global" && (
        <>
          {/* Top 3 Performers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topPerformers.map((performer) => (
              <div
                key={performer.rank}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${performer.color} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold`}
                  >
                    {performer.rank}
                  </div>
                  <span className="text-2xl">{performer.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{performer.username}</h3>
                <p className="text-sm text-orange-500 font-semibold mb-4">{performer.title}</p>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{performer.score.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Points</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{performer.contests}</p>
                      <p className="text-xs text-gray-600">Contests</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Filter:</span>
                <div className="flex gap-2">
                  {["all-time", "this-month", "this-week"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                        timeFilter === filter
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter === "all-time" ? "All Time" : filter === "this-month" ? "This Month" : "This Week"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="rank">Rank</option>
                  <option value="score">Score</option>
                  <option value="solved">Problems Solved</option>
                  <option value="contests">Contests</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">RANK</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">USER</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">TOTAL SCORE</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">SOLVED</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">CONTESTS</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">WIN RATE</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">BEST RANK</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length > 0 ? (
                    sortedData.map((user, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900">{user.rank}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {user.username.charAt(1).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900">{user.username}</span>
                            {user.verified && <span className="text-blue-500 text-lg">✓</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-gray-900">{user.totalScore.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4 text-right text-gray-600">{user.solved}</td>
                        <td className="py-4 px-4 text-right text-gray-600">{user.contests}</td>
                        <td className="py-4 px-4 text-right text-gray-600">{user.winRate}</td>
                        <td className="py-4 px-4 text-right text-gray-600">{user.bestRank}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-600">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "running" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Contest Leaderboards</h2>
          <div className="space-y-8">
            {[
              {
                contest: "UCP Weekly #105",
                problems: [
                  { name: "Two Sum", status: "solved" },
                  { name: "Matrix Rotation", status: "attempted" },
                  { name: "Shortest Path", status: "unattempted" },
                  { name: "LCS", status: "solved" },
                ],
              },
              {
                contest: "Junior Sprint 2025",
                problems: [
                  { name: "Array Sum", status: "solved" },
                  { name: "String Manipulation", status: "attempted" },
                  { name: "Tree Traversal", status: "solved" },
                ],
              },
            ].map((item, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{item.contest}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Rank</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                        {item.problems.map((p) => (
                          <th key={p.name} className="text-center py-3 px-4 font-semibold text-gray-900">
                            {p.name}
                          </th>
                        ))}
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { rank: 1, user: "CodeMaster99", scores: [100, 0, 0, 100] },
                        { rank: 2, user: "AlgoQueen", scores: [100, 50, 0, 100] },
                        { rank: 3, user: "ByteWizard", scores: [100, 0, 50, 0] },
                      ].map((row) => (
                        <tr key={row.rank} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-gray-900">{row.rank}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{row.user}</td>
                          {row.scores.map((score, idx) => (
                            <td key={idx} className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  score === 100
                                    ? "bg-green-100 text-green-700"
                                    : score > 0
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {score === 100 ? "✓" : score > 0 ? "✗" : "○"}
                              </span>
                            </td>
                          ))}
                          <td className="py-3 px-4 text-center font-bold text-gray-900">
                            {row.scores.reduce((a, b) => a + b, 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6 mt-8">
        <h3 className="font-bold text-gray-900 mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-orange-500">842</p>
            <p className="text-sm text-gray-600">Current Rank</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">1,450</p>
            <p className="text-sm text-gray-600">Total Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">45</p>
            <p className="text-sm text-gray-600">Problems Solved</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-600">Contests</p>
          </div>
        </div>
      </div>
    </div>
  )
}
