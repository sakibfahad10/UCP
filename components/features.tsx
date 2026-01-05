export default function Features() {
  const features = [
    {
      title: "Live Contests",
      description: "Real-time contests with instant feedback and detailed standings",
      icon: "⚡",
    },
    {
      title: "Integrated IDE",
      description: "Complete, online code editor directly in your browser",
      icon: "💻",
    },
    {
      title: "Global Leaderboard",
      description: "Track your progress, earn badges and compete against peers in the university",
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
        <p className="text-gray-600">
          Everything you need to excel in competitive programming right at your fingertips.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
