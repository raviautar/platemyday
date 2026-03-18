import { Metadata } from 'next';
import Link from 'next/link';
import { BlogPost } from '@/components/blog/BlogPost';

export const metadata: Metadata = {
  title: 'Household Food Waste Statistics 2026: The $2,913 Habit You Don\'t Know You Have',
  description: 'A data-driven deep-dive into how much food American households waste every year — in dollars, CO₂ emissions, and water usage — and what you can do about it.',
  alternates: { canonical: '/blog/household-food-waste-statistics' },
  openGraph: {
    title: 'Household Food Waste Statistics 2026: The $2,913 Yearly Habit',
    description: 'How much food do American households really waste? A data-driven deep-dive into the numbers, the causes, and the solutions.',
    url: '/blog/household-food-waste-statistics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Household Food Waste Statistics 2026: The $2,913 Yearly Habit',
    description: 'A data-driven deep-dive into household food waste — in dollars, emissions, and water usage.',
    images: ['/opengraph-image'],
  },
};

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="bg-white border border-[#E4D9CC] rounded-2xl p-5 text-center">
      <div className="text-3xl sm:text-4xl font-bold text-[#3A7D44] font-[family-name:var(--font-outfit)] mb-1">{value}</div>
      <div className="text-sm font-semibold text-[#2C2016]">{label}</div>
      {sub && <div className="text-xs text-[#9B8B7A] mt-0.5">{sub}</div>}
    </div>
  );
}

function BarChart({ data }: { data: { label: string; pct: number; color: string }[] }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="w-28 sm:w-36 text-xs text-[#4A3728] text-right shrink-0">{item.label}</div>
          <div className="flex-1 bg-[#F3EDE4] rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
              style={{ width: `${item.pct}%`, backgroundColor: item.color }}
            >
              <span className="text-white text-[10px] font-bold">{item.pct}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Post() {
  return (
    <BlogPost
      title="Household Food Waste Statistics 2026: The $2,913 Yearly Habit You Don't Know You Have"
      description="The average American family of four throws away nearly $3,000 worth of food every year. Here's what the data actually shows — and what the most effective households do differently."
      publishedAt="March 2026"
      readingTime="7 min read"
    >
      <div className="space-y-10 text-[#4A3728] leading-relaxed">

        {/* Hook */}
        <section className="space-y-4">
          <p className="text-lg">
            Imagine finding a $56 bill in your pocket every week. Now imagine throwing it in the bin. That is, statistically, what the average American household of four does with their food — every single week, without noticing.
          </p>
          <p>
            Food waste is one of those problems that operates almost entirely below the threshold of conscious awareness. No single act of waste feels significant enough to count. A handful of wilted spinach here. A forgotten container of leftovers there. The lemon you meant to use that went dry. But these moments accumulate into a staggering annual figure, and the research that has emerged over the past few years puts hard numbers to something most households only vaguely suspect.
          </p>
          <p>
            This article collects the most current and reliable data on household food waste — what we throw away, what it costs, what it does to the planet, and which simple behavioural shifts make the biggest difference.
          </p>
        </section>

        {/* The numbers */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            The Numbers: How Much Do We Actually Waste?
          </h2>
          <p>
            The scale of household food waste in the United States is genuinely difficult to internalise. The EPA&apos;s most recent consumer food waste analysis, drawing on data from 2019–2023, arrives at these figures:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard value="35M tons" label="food wasted annually" sub="by US consumers" />
            <StatCard value="$261B" label="total annual cost" sub="across US households" />
            <StatCard value="$800" label="per person per year" sub="in wasted food spend" />
            <StatCard value="$2,913" label="per family of four" sub="$56 per week" />
          </div>

          <p>
            To put the $261 billion figure in context: that is larger than the entire GDP of Portugal. It is spent not on food that was eaten, but on food that was purchased, carried home, and discarded.
          </p>
          <p>
            The 35 million tons of annual consumer waste accounts for <strong>nearly 50% of all surplus food</strong> in the US. This is the portion generated after food has already made it to the consumer level — past farms, distributors, and retail. It is the waste that individual households have the most direct power to influence.
          </p>
          <p>
            On a per-person basis, Americans discard roughly <strong>325 pounds of food per year</strong> — nearly a pound per day. Globally, the picture is similarly alarming: the UN estimates that 1.05 billion metric tons of food were wasted in 2022, representing one-fifth of all food available to consumers worldwide.
          </p>
        </section>

        {/* What foods */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            Which Foods Do Households Waste Most?
          </h2>
          <p>
            Not all food waste is equal. Fresh produce is the dominant category by volume, but wasted meat and fish carry a disproportionate environmental footprint per kilogram. Research consistently shows the following breakdown by household food waste category:
          </p>

          <div className="bg-[#FEFCF8] border border-[#E4D9CC] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9B8B7A] mb-4">Share of household food waste by category</p>
            <BarChart
              data={[
                { label: 'Fruits & vegetables', pct: 39, color: '#3A7D44' },
                { label: 'Dairy & eggs', pct: 17, color: '#6BAF78' },
                { label: 'Meat & seafood', pct: 14, color: '#D4764E' },
                { label: 'Grains & bread', pct: 12, color: '#C4A882' },
                { label: 'Prepared foods', pct: 10, color: '#8B7355' },
                { label: 'Other', pct: 8, color: '#B0A090' },
              ]}
            />
            <p className="text-xs text-[#9B8B7A] mt-3">Source: ReFED Consumer Food Waste Report 2025. Figures are approximate and represent % of waste by weight.</p>
          </div>

          <p>
            Fruits and vegetables account for the largest share at around 39% of household waste — largely because they have short shelf lives, and because most people buy them for specific recipes rather than integrating them into a broader weekly plan. The result is predictable: the bag of kale bought for a single smoothie, the bell peppers bought for a stir-fry that never happened, the avocados that all ripened at once.
          </p>
          <p>
            Dairy and egg waste — 17% — is often driven by portion-size mismatches. A recipe calls for two tablespoons of sour cream; you buy the smallest container available; the rest sits in the fridge and goes off.
          </p>
          <p>
            Meat and seafood waste (14% by volume) carries an outsized environmental cost because of the land, water, and energy required to produce animal protein. Wasting a pound of beef is environmentally roughly equivalent to driving 30 miles in a petrol car.
          </p>
        </section>

        {/* Environmental */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            The Environmental Price Tag
          </h2>
          <p>
            The financial cost of food waste is significant. The environmental cost is staggering.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[#F0F7F1] border border-[#3A7D44]/20 rounded-2xl p-5 text-center">
              <div className="text-2xl font-bold text-[#3A7D44] font-[family-name:var(--font-outfit)] mb-1">154M</div>
              <div className="text-xs font-semibold text-[#2C2016] mb-1">metric tons of CO₂e</div>
              <div className="text-xs text-[#9B8B7A]">Generated by US consumer food waste annually — equivalent to 36M passenger vehicles driven for a year</div>
            </div>
            <div className="bg-[#FFF8F4] border border-[#D4764E]/20 rounded-2xl p-5 text-center">
              <div className="text-2xl font-bold text-[#D4764E] font-[family-name:var(--font-outfit)] mb-1">9 trillion</div>
              <div className="text-xs font-semibold text-[#2C2016] mb-1">gallons of water</div>
              <div className="text-xs text-[#9B8B7A]">Consumed to produce food that US consumers discard — enough to fill 13M Olympic swimming pools</div>
            </div>
            <div className="bg-[#F8F4F0] border border-[#8B7355]/20 rounded-2xl p-5 text-center">
              <div className="text-2xl font-bold text-[#8B7355] font-[family-name:var(--font-outfit)] mb-1">8–10%</div>
              <div className="text-xs font-semibold text-[#2C2016] mb-1">of global greenhouse gases</div>
              <div className="text-xs text-[#9B8B7A]">Attributed to food loss and waste across the entire supply chain</div>
            </div>
          </div>

          <p>
            Food waste in landfill is particularly damaging because organic matter decomposes anaerobically in that environment, producing methane — a greenhouse gas roughly 80 times more potent than CO₂ over a 20-year timeframe. The 154 million metric tons of CO₂-equivalent generated by consumer food waste in the US each year is not the full picture; it is only what can be attributed to the consumer end of the chain. Supply chain and agricultural waste add considerably more.
          </p>
          <p>
            The water footprint of wasted food is another dimension that rarely gets discussed. Producing a kilogram of beef requires approximately 15,000 litres of water. A kilogram of wheat requires around 1,500 litres. When that food is thrown away, the water that went into producing it is also effectively wasted. The 9 trillion gallons figure for US consumer food waste represents a meaningful contribution to water stress in an era when freshwater is increasingly treated as a scarce resource.
          </p>
          <p>
            Global food loss and waste is now estimated to generate <strong>8–10% of all greenhouse gas emissions</strong> worldwide — more than the entire aviation industry. If food waste were a country, it would be the world&apos;s third-largest emitter of greenhouse gases after the US and China.
          </p>
        </section>

        {/* Psychology */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            Why Do We Waste So Much? The Psychology of Kitchen Waste
          </h2>
          <p>
            Understanding why households waste food requires understanding some consistent psychological patterns that most people don&apos;t recognise in themselves.
          </p>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[480px] text-sm border-collapse">
              <thead>
                <tr className="bg-[#F3EDE4]">
                  <th className="text-left p-3 font-semibold text-[#2C2016] rounded-tl-xl">Behaviour</th>
                  <th className="text-left p-3 font-semibold text-[#2C2016] rounded-tr-xl">Why it causes waste</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { beh: 'Recipe-first meal planning', why: 'You buy ingredients for specific dishes; leftovers have no home in next week\'s plan' },
                  { beh: 'Optimistic portion sizing', why: 'We consistently overestimate how much we\'ll cook and eat' },
                  { beh: '"I\'ll eat it later" loops', why: 'Leftovers are repeatedly deprioritised until they spoil' },
                  { beh: 'Bulk buying', why: 'Volume discounts are appealing but produce more than households can consume before expiry' },
                  { beh: 'Date label confusion', why: '"Best before" vs "use by" confusion leads to safe food being discarded unnecessarily' },
                  { beh: 'Pantry blindness', why: 'Out-of-sight ingredients are forgotten; duplicate purchases compound the problem' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FEFCF8]'}>
                    <td className="p-3 font-medium text-[#2C2016]">{row.beh}</td>
                    <td className="p-3 text-[#6B5744]">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            The single most impactful behaviour on this list is <strong>recipe-first meal planning</strong>. This is the default mode for almost every household: you decide what you want to eat, look up a recipe, write a shopping list, and go to the store. The problem is structural — the shopping list is written without reference to what is already in your kitchen. You buy a full bunch of parsley for a recipe that needs a tablespoon. The remainder wilts. You buy chicken thighs for a specific dish; you buy chicken breast for another. You end up with overlapping proteins and not enough meals to use both.
          </p>
          <p>
            Flipping to an ingredient-first approach — where your existing pantry drives the meal plan, not the other way around — structurally eliminates most of these failure modes. It is not a willpower-dependent behaviour change; it is a system change.
          </p>
        </section>

        {/* What reducing waste saves */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            What Does Reducing Waste Actually Save You?
          </h2>
          <p>
            The $2,913 annual figure for a family of four is the most useful single number here — but it is an average, and averages obscure useful variation. Research consistently shows that food waste is not randomly distributed across households. The households that waste the least share a small number of consistent practices.
          </p>

          <div className="bg-[#F0F7F1] border border-[#3A7D44]/20 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#3A7D44]">Estimated annual savings from waste-reduction habits</p>
            <div className="space-y-2 text-sm">
              {[
                { habit: 'Taking a weekly pantry inventory before shopping', saving: '$400–600/yr' },
                { habit: 'Ingredient-first meal planning (vs recipe-first)', saving: '$600–900/yr' },
                { habit: 'Batch cooking and planned leftover meals', saving: '$300–500/yr' },
                { habit: 'Proper food storage habits (fridge zones, containers)', saving: '$200–400/yr' },
                { habit: 'Combined approach: all of the above', saving: '$1,200–2,000/yr' },
              ].map((row) => (
                <div key={row.habit} className="flex items-center justify-between gap-4 py-1.5 border-b border-[#3A7D44]/10 last:border-0">
                  <span className="text-[#4A3728]">{row.habit}</span>
                  <span className="font-semibold text-[#3A7D44] shrink-0">{row.saving}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#9B8B7A]">Estimates derived from ReFED 2025 data and consumer behaviour research. Individual results vary.</p>
          </div>

          <p>
            The ingredient-first meal planning category consistently produces the largest single-habit saving — somewhere in the $600–$900 range per year for a typical household — because it addresses the structural root cause rather than treating symptoms. You are not trying to remember to use up your produce; you are building a plan that uses it up by design.
          </p>
        </section>

        {/* Solutions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            The Most Effective Way to Reduce Food Waste at Home
          </h2>
          <p>
            Research into household food waste reduction has identified a consistent hierarchy of intervention effectiveness. At the top — more effective than composting, smarter storage, or portion education — is <strong>changing how the shopping list gets written</strong>.
          </p>
          <p>
            If your shopping list is generated from recipes, you will structurally tend to overbuy speciality ingredients and underconsume them. If your shopping list is generated from your pantry — meaning you check what you have first, build meals around it, and only add what is genuinely missing — you will structurally tend to buy less and use more.
          </p>
          <p>
            This is the principle behind ingredient-based meal planning, and it is why apps in this category have seen strong growth despite being a relatively young product category. The behaviour change required is minimal (you are still planning meals and shopping for food), but the structural outcome is fundamentally different.
          </p>
          <p>
            For households looking to make the largest dent in their food waste with the smallest change to their routine, starting with a pantry inventory before planning each week&apos;s meals is the single most impactful step. The friction of doing this manually — opening every cabinet, every fridge shelf — is also why tools that make pantry tracking easy tend to produce the largest real-world impact.
          </p>
          <div className="bg-[#F0F7F1] border border-[#3A7D44]/20 rounded-2xl p-5 text-sm">
            <p className="font-semibold text-[#3A7D44] mb-2">Ready to try ingredient-first planning?</p>
            <p className="text-[#4A3728]">
              PlateMyDay builds a full 7-day meal plan from your pantry ingredients — free to try, no account needed.{' '}
              <Link href="/meal-plan" className="text-[#3A7D44] underline underline-offset-2 font-semibold hover:no-underline">
                Start here →
              </Link>
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            The Takeaway
          </h2>
          <p>
            The data on household food waste is not encouraging — but it is clarifying. The problem is large ($261 billion per year), it is environmentally costly (8–10% of global greenhouse emissions), and it is driven by behaviours that are genuinely changeable.
          </p>
          <p>
            The households that waste the least are not particularly disciplined or environmentally motivated. They have systems that make waste the path of most resistance. Writing a shopping list that starts with the pantry rather than a recipe is one of the simplest systems to implement — and the research suggests it is also one of the most effective.
          </p>
          <p>
            At $56 per week, the average family of four is spending more on wasted food than on most household utility bills. That money is sitting in the kitchen, getting thrown away quietly, week after week. The fix is less about willpower than about planning sequence.
          </p>
        </section>

      </div>
    </BlogPost>
  );
}
