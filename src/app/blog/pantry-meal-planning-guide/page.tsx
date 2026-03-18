import { Metadata } from 'next';
import Link from 'next/link';
import { BlogPost } from '@/components/blog/BlogPost';

export const metadata: Metadata = {
  title: 'The Complete Guide to Pantry Meal Planning (2026)',
  description: 'A practical step-by-step guide to cooking from the ingredients you already have. Learn how to plan a full week of meals from your pantry, reduce your grocery bill, and stop throwing food away.',
  alternates: { canonical: '/blog/pantry-meal-planning-guide' },
  openGraph: {
    title: 'The Complete Guide to Pantry Meal Planning (2026)',
    description: 'How to plan a full week of meals from what\'s already in your kitchen — step by step.',
    url: '/blog/pantry-meal-planning-guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Complete Guide to Pantry Meal Planning (2026)',
    description: 'A step-by-step guide to cooking from the ingredients you already have.',
    images: ['/opengraph-image'],
  },
};

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-9 h-9 rounded-full bg-[#3A7D44] text-white font-bold font-[family-name:var(--font-outfit)] flex items-center justify-center text-sm mt-0.5">
        {n}
      </div>
      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function Post() {
  return (
    <BlogPost
      title="The Complete Guide to Pantry Meal Planning: How to Cook from What You Have"
      description="Most meal planning advice tells you to pick recipes, then shop. This guide flips that sequence — and it's why households that do it consistently spend $600–$900 less on groceries every year."
      publishedAt="March 2026"
      readingTime="9 min read"
    >
      <div className="space-y-10 text-[#4A3728] leading-relaxed">

        {/* Intro */}
        <section className="space-y-4">
          <p className="text-lg">
            Pantry meal planning — sometimes called &quot;reverse meal planning&quot; or ingredient-first cooking — is the practice of checking what you already have in your kitchen <em>before</em> deciding what to cook, rather than the other way around. It sounds obvious when stated plainly. In practice, it is the opposite of how most households actually plan their meals.
          </p>
          <p>
            Most of us pick meals we want to eat, find recipes, write a shopping list, and go to the store. The pantry is an afterthought, consulted only when something on the list turns out to already be there. The result is predictable: duplicate purchases, half-used bags of specialty ingredients, and produce that looked good in the recipe photo but never made it into a meal.
          </p>
          <p>
            Research consistently shows that households using ingredient-first planning save between <strong>$600–$900 per year</strong> in reduced food waste — without any deliberate changes to what they eat or how much time they spend cooking. The savings come purely from the sequence: pantry first, recipes second.
          </p>
          <p>
            This guide covers the complete method: how to take a useful kitchen inventory, how to build meals from what you find, how to handle common obstacles, and which pantry staples make the system work week after week.
          </p>
        </section>

        {/* Why most fails */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            Why Traditional Meal Planning Creates Waste (and Frustration)
          </h2>
          <p>
            Traditional meal planning has a structural flaw: it treats your kitchen as if it were empty. Every week starts with a blank slate — you choose recipes, generate a shopping list, and buy everything from scratch. This works fine in theory. In practice, it generates a consistent set of problems:
          </p>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[480px] text-sm border-collapse">
              <thead>
                <tr className="bg-[#F3EDE4]">
                  <th className="text-left p-3 font-semibold text-[#2C2016] rounded-tl-xl">The problem</th>
                  <th className="text-left p-3 font-semibold text-[#2C2016] rounded-tr-xl">What actually happens</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { prob: 'Recipe requires a specialty ingredient', res: 'You buy it, use 2 tbsp, and the rest sits unused' },
                  { prob: 'You already have something similar at home', res: 'You buy the recipe\'s version anyway, creating duplicates' },
                  { prob: 'Produce is bought for specific dishes', res: 'One skipped meal = the whole bunch goes to waste' },
                  { prob: 'Leftover ingredients from last week', res: 'They get ignored in next week\'s plan and eventually expire' },
                  { prob: 'Plan doesn\'t match energy levels mid-week', res: 'Complex recipes get abandoned; the ingredients go off' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FEFCF8]'}>
                    <td className="p-3 font-medium text-[#2C2016]">{row.prob}</td>
                    <td className="p-3 text-[#6B5744]">{row.res}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Ingredient-first planning solves most of these structurally. When you build the meal plan around existing ingredients, the specialty ingredient is the starting point rather than a side effect. Leftovers from last week become the base of this week&apos;s plan. Nothing is purchased without a meal to use it in.
          </p>
        </section>

        {/* The 5-step method */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            The 5-Step Pantry Meal Planning Method
          </h2>
          <p>
            The full method takes about 20 minutes per week. The first time takes longer because you are building the habit and learning which categories your kitchen needs in each zone. After a few weeks, 15 minutes is a reasonable target.
          </p>

          <div className="space-y-7">
            <Step n={1} title="Take a Complete Kitchen Inventory">
              <p className="text-sm">
                Go through every storage zone in your kitchen: the main fridge compartment, the crisper drawers, the freezer (including any meat you have buried in the back), the main pantry shelves, the cupboard where tins and cans live, the dry goods shelf, and any overflow storage. Write down — or photograph — everything you find.
              </p>
              <p className="text-sm">
                Don&apos;t edit as you go. Write down even the half-empty bag of lentils, the small quantity of rice at the bottom of the container, and the partial block of cheese. Small quantities matter: they often become the flavour component of a meal rather than the main ingredient, but they need to be in your inventory to get used.
              </p>
              <div className="bg-[#F0F7F1] border border-[#3A7D44]/20 rounded-xl p-4 text-sm">
                <p className="font-semibold text-[#3A7D44] mb-1">Shortcut:</p>
                <p>Use PlateMyDay to store your pantry inventory digitally. Once it&apos;s set up, updating it after a shop takes 2–3 minutes rather than starting from scratch each week.</p>
              </div>
            </Step>

            <Step n={2} title="Flag Items by Expiry Priority">
              <p className="text-sm">
                Once you have your inventory, do a quick triage. Mark three priority tiers:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3 items-start">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 border border-red-300 text-red-700 text-[10px] font-bold flex items-center justify-center shrink-0">!</span>
                  <span><strong className="text-[#2C2016]">Use this week:</strong> anything with &lt;5 days remaining, produce starting to soften, opened items, leftover proteins from last week</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">~</span>
                  <span><strong className="text-[#2C2016]">Use soon:</strong> items with 5–14 days left, vegetables at peak ripeness, dairy approaching best-before</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 border border-green-300 text-green-700 text-[10px] font-bold flex items-center justify-center shrink-0">✓</span>
                  <span><strong className="text-[#2C2016]">Stable:</strong> tinned goods, dried pasta, frozen items — these can fill gaps in any week&apos;s plan without urgency</span>
                </div>
              </div>
              <p className="text-sm">
                Your high-priority items should appear in meals early in the week. Your stable items are flexible and can anchor any meal slot you haven&apos;t yet filled.
              </p>
            </Step>

            <Step n={3} title="Build Meals Around High-Priority Ingredients">
              <p className="text-sm">
                Now comes the creative part. Start with your &quot;use this week&quot; items and work outward. The question for each high-priority ingredient is: <em>what meal anchors around this?</em>
              </p>
              <p className="text-sm">
                A few practical examples of how pantry items translate to meal anchors:
              </p>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[440px] text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#F3EDE4]">
                      <th className="text-left p-2.5 font-semibold text-[#2C2016]">What you have</th>
                      <th className="text-left p-2.5 font-semibold text-[#2C2016]">Possible meal anchors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { have: 'Chicken thighs + rice + frozen peas', meals: 'Chicken fried rice, one-tray roast chicken & veg, soup' },
                      { have: 'Canned tomatoes + pasta + garlic', meals: 'Pasta arrabbiata, shakshuka, tomato risotto (if you have rice)' },
                      { have: 'Eggs + cheese + bell pepper', meals: 'Frittata, omelette, egg fried rice, breakfast burritos' },
                      { have: 'Lentils + onion + tinned coconut milk', meals: 'Red lentil dal, lentil soup, lentil curry' },
                      { have: 'Minced beef + onion + tinned kidney beans', meals: 'Chilli, Bolognese, cottage pie (if you have potato)' },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FEFCF8]'}>
                        <td className="p-2.5 font-medium text-[#2C2016]">{row.have}</td>
                        <td className="p-2.5 text-[#6B5744]">{row.meals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                Build enough meal anchors to cover the number of dinners you cook per week, plus lunches if you plan those. Once you have your anchors, assign them to specific days based on effort level — save the more complex meals for days when you typically have more time.
              </p>
            </Step>

            <Step n={4} title="Identify Genuine Gaps and Write a Minimal Shopping List">
              <p className="text-sm">
                Once your meals are planned, go through each recipe and compare its ingredient list to your pantry inventory. Anything genuinely missing goes on the shopping list. Anything you already have — even in a slightly different form — does not.
              </p>
              <p className="text-sm">
                The phrase &quot;slightly different form&quot; is worth pausing on. Many shoppers buy tinned tomatoes for a recipe that calls for tinned tomatoes — even though they already have passata, fresh tomatoes, or tomato paste. For most recipes, these are functionally interchangeable, and an ingredient-first mindset recognises that.
              </p>
              <p className="text-sm">
                A genuinely minimal shopping list for a week of home cooking typically runs to <strong>6–12 items</strong> for a household that has been maintaining a stocked pantry. If your list runs longer, that is usually a sign that the pantry baseline needs building — which is what the next section covers.
              </p>
            </Step>

            <Step n={5} title="Cook in Priority Order and Reset Weekly">
              <p className="text-sm">
                Cook the highest-priority meals first. Monday and Tuesday should consume your most perishable items. Wednesday–Friday can use items from your &quot;use soon&quot; tier. The weekend is ideal for your most stable ingredients — dried grains, tinned goods, frozen proteins.
              </p>
              <p className="text-sm">
                At the end of the week — ideally before your next shop — do a quick inventory reset. What was used? What moved from &quot;stable&quot; to &quot;use soon&quot; because it&apos;s been open for a week? Update your list. This is the step that creates the flywheel: once your pantry tracking is current, building next week&apos;s plan takes 10–15 minutes instead of an hour.
              </p>
              <div className="bg-[#F0F7F1] border border-[#3A7D44]/20 rounded-xl p-4 text-sm">
                <p className="font-semibold text-[#3A7D44] mb-1">The compound effect:</p>
                <p>Households who maintain an up-to-date pantry inventory for 4+ weeks report that the planning process gets progressively faster and the shopping list gets progressively shorter. The system self-improves because you stop buying things you already have.</p>
              </div>
            </Step>
          </div>
        </section>

        {/* Pantry staples */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            Pantry Staples That Make the System Work
          </h2>
          <p>
            Ingredient-first planning works best when your pantry has a reliable base of versatile, long-shelf-life items that can anchor or support almost any meal. These are not the exciting ingredients — they are the ones that turn &quot;I have chicken and nothing else&quot; into &quot;I have chicken, so I can make 12 things.&quot;
          </p>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[520px] text-sm border-collapse">
              <thead>
                <tr className="bg-[#3A7D44] text-white">
                  <th className="text-left p-3 font-semibold rounded-tl-xl">Category</th>
                  <th className="text-left p-3 font-semibold">Must-have items</th>
                  <th className="text-left p-3 font-semibold rounded-tr-xl">Why they matter</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Grains & starch', items: 'Rice (white & brown), pasta, dried lentils, oats', why: 'Bulk up any meal; absorb flavour from whatever protein or sauce you have' },
                  { cat: 'Tinned goods', items: 'Chopped tomatoes, chickpeas, kidney beans, coconut milk, tuna', why: 'Instant bases for curries, stews, pasta sauces; long shelf life means zero urgency' },
                  { cat: 'Aromatics', items: 'Onions, garlic, ginger (fresh or frozen)', why: 'Foundation of almost every savoury dish; cheap, long-lasting, universally applicable' },
                  { cat: 'Cooking fats', items: 'Olive oil, neutral oil (vegetable or sunflower), butter', why: 'Required for almost every cooking method; don\'t let a recipe fail because you lack oil' },
                  { cat: 'Acids', items: 'Soy sauce, white wine vinegar, lemon juice (bottled)', why: 'Balance and brighten dishes; substitute for fresh citrus when you don\'t have it' },
                  { cat: 'Spices', items: 'Cumin, smoked paprika, turmeric, cinnamon, chilli flakes', why: 'Transform simple combinations; turn rice + lentils into a completely different dish depending on spice' },
                  { cat: 'Frozen proteins', items: 'Chicken thighs or breast, minced beef or turkey, fish fillets, edamame', why: 'Frozen proteins last months and thaw overnight; always have a protein base available' },
                  { cat: 'Frozen vegetables', items: 'Peas, sweetcorn, spinach, mixed stir-fry veg', why: 'Nutrition and bulk without spoilage pressure; as nutritious as fresh' },
                  { cat: 'Condiments', items: 'Stock cubes or paste, tomato paste, fish sauce, mustard', why: 'Depth of flavour in 30-minute meals; stock cube turns water into a braising liquid' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FEFCF8]'}>
                    <td className="p-3 font-medium text-[#2C2016]">{row.cat}</td>
                    <td className="p-3 text-[#4A3728]">{row.items}</td>
                    <td className="p-3 text-[#6B5744] text-xs">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Building this baseline does not require a significant one-off investment. Buy one or two items from each category per week over a month and the pantry fills itself. Once it is established, your weekly shop becomes almost entirely perishables — fresh produce, dairy, and whatever proteins are on offer — because the pantry backbone never needs replacing in bulk.
          </p>
        </section>

        {/* Sample week */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            A Sample Week Built From a Typical Pantry
          </h2>
          <p>
            To make this concrete, here is an example of a full week of meals built from a well-stocked but not exotic pantry. The available ingredients are: chicken thighs, tinned tomatoes, dried pasta, rice, red lentils, eggs, frozen peas, onions, garlic, spinach, coconut milk, cumin, smoked paprika, olive oil, and stock cubes.
          </p>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[520px] text-sm border-collapse">
              <thead>
                <tr className="bg-[#F3EDE4]">
                  <th className="text-left p-3 font-semibold text-[#2C2016] rounded-tl-xl">Day</th>
                  <th className="text-left p-3 font-semibold text-[#2C2016]">Dinner</th>
                  <th className="text-left p-3 font-semibold text-[#2C2016] rounded-tr-xl">Key ingredients used</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { day: 'Monday', meal: 'Chicken & tomato stew over rice', key: 'Chicken thighs, tinned tomatoes, garlic, onion, rice' },
                  { day: 'Tuesday', meal: 'Red lentil dal with frozen spinach', key: 'Red lentils, coconut milk, cumin, spinach' },
                  { day: 'Wednesday', meal: 'Pasta arrabbiata with a fried egg on top', key: 'Pasta, tinned tomatoes, garlic, eggs' },
                  { day: 'Thursday', meal: 'Egg fried rice with frozen peas', key: 'Rice (leftover from Monday), eggs, frozen peas, soy sauce' },
                  { day: 'Friday', meal: 'Chicken & chickpea one-tray bake', key: 'Remaining chicken, smoked paprika, olive oil, onion' },
                  { day: 'Saturday', meal: 'Lentil soup with crusty bread', key: 'Lentils, stock cube, onion, garlic — relaxed long cook' },
                  { day: 'Sunday', meal: 'Shakshuka with leftover tomato base', key: 'Eggs, remaining tinned tomatoes, spices, garlic' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FEFCF8]'}>
                    <td className="p-3 font-semibold text-[#2C2016]">{row.day}</td>
                    <td className="p-3 text-[#4A3728]">{row.meal}</td>
                    <td className="p-3 text-[#6B5744] text-xs">{row.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-[#9B8B7A]">
            Shopping list for this week: nothing, assuming the pantry baseline is stocked. If starting fresh, the shop would be ~8 items totalling approximately £20–25 / $25–30.
          </p>

          <p>
            Notice the deliberate overlap: Monday&apos;s leftover rice becomes Thursday&apos;s fried rice. The chicken portion is split across Monday and Friday. The tinned tomatoes serve three different flavour profiles (Monday&apos;s stew, Wednesday&apos;s pasta, Sunday&apos;s shakshuka) using only different spicing.
          </p>
        </section>

        {/* Obstacles */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            Common Obstacles — and How to Handle Them
          </h2>
          <p>
            Most households encounter the same small set of obstacles when first switching to ingredient-first planning. Here is how to handle each one:
          </p>

          <div className="space-y-4">
            {[
              {
                problem: '"I don\'t know what to make from these ingredients."',
                solution: 'This is the most common blocker and the one where tools help most. PlateMyDay will generate a full week\'s plan from your ingredient list in seconds. For one-off lookups, SuperCook is a useful starting point. The mental leap from "ingredients" to "complete recipe" is exactly what these tools automate.'
              },
              {
                problem: '"My household has different dietary preferences."',
                solution: 'Ingredient-first planning actually handles this better than recipe-first, because you can apply dietary filters to the generation step rather than the shopping step. The pantry is dietary-neutral; the meals you build from it are not.'
              },
              {
                problem: '"I get bored cooking the same pantry staples every week."',
                solution: 'The variety comes from spicing and technique, not from buying different base ingredients. The same chicken thigh + rice + pantry aromatics produces Thai-style basil chicken, Moroccan-spiced one-tray bake, and simple chicken soup depending on which spices you use. The staple base is the canvas, not the constraint.'
              },
              {
                problem: '"The pantry inventory is too time-consuming to maintain."',
                solution: 'Once the initial inventory is done, maintenance is light: update after each shop (3–5 minutes) and quick-check before planning day (5 minutes). The first inventory is the hard part. Every subsequent week is a small delta.'
              },
              {
                problem: '"I shop at multiple stores and lose track of what I have."',
                solution: 'Keep all inventory in one place — a dedicated notes app, a spreadsheet, or a dedicated pantry-tracking tool. If you shop at multiple stores, the inventory is even more valuable because the mental load of tracking multiple sources is high without a written record.'
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#E4D9CC] rounded-xl p-5 space-y-2">
                <p className="font-semibold text-[#2C2016] text-sm">{item.problem}</p>
                <p className="text-sm text-[#6B5744]">{item.solution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Using PlateMyDay */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            Automating the Hard Part with PlateMyDay
          </h2>
          <p>
            The most time-consuming step in pantry meal planning — going from &quot;I have these ingredients&quot; to &quot;here is a complete, balanced, week of meals&quot; — is exactly what PlateMyDay automates.
          </p>
          <p>
            You add your available ingredients. The app generates a full 7-day plan with complete recipes built around those items. It then produces a consolidated shopping list covering only genuine gaps. The process takes a few minutes rather than 20–30, and the plan is tailored to your dietary preferences.
          </p>
          <p>
            The difference from a recipe search engine (like SuperCook) is scope. PlateMyDay is not showing you one recipe that uses your chicken — it is planning the entire week in a way that uses up your perishables systematically, avoids repetition, and produces a single minimal shopping list for everything you need to top up.
          </p>
          <div className="bg-[#F0F7F1] border border-[#3A7D44]/20 rounded-2xl p-5 text-sm">
            <p className="font-semibold text-[#3A7D44] mb-2">Free to start:</p>
            <p className="text-[#4A3728]">
              PlateMyDay includes 10 free meal plan generations with no account required — enough to try the ingredient-first method for several weeks and see whether it works for your household.{' '}
              <Link href="/meal-plan" className="text-[#3A7D44] underline underline-offset-2 font-semibold hover:no-underline">
                Generate your first pantry plan →
              </Link>
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2C2016] font-[family-name:var(--font-outfit)]">
            The Shift Worth Making
          </h2>
          <p>
            Pantry meal planning is not a difficult skill. It is a sequence change: pantry first, recipes second. That single inversion — checking what you have before deciding what to cook — structurally reduces waste, reduces the weekly shopping bill, and often leads to more interesting meals because it forces creative use of what&apos;s available.
          </p>
          <p>
            The households that do this consistently do not report it feeling restrictive. They report the opposite: less anxiety about wasted food, less guilt at the bin, and a kind of satisfaction in using things up that recipe-first planning never produces. The pantry gradually fills with interesting staples. The shopping trips get shorter. The meals get more familiar and therefore faster to cook.
          </p>
          <p>
            The method works at any income level, any household size, and any dietary preference. The only prerequisite is spending 20 minutes on the first inventory. Everything after that is incremental.
          </p>
        </section>

      </div>
    </BlogPost>
  );
}
