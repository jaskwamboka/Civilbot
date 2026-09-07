import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const features = [
  {
    title: 'Simply Supported Beams',
    description: 'Analyze single-span beams with two supports using equilibrium equations.',
    icon: (
      <svg viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-12 w-24">
        <line x1="4" y1="12" x2="44" y2="12" />
        <polygon points="4,12 8,20 0,20" fill="currentColor" />
        <circle cx="44" cy="16" r="4" />
        <line x1="24" y1="4" x2="24" y2="12" />
        <polygon points="24,4 20,8 28,8" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Continuous Beams',
    description: 'Multi-span analysis using the three-moment equation method.',
    icon: (
      <svg viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-12 w-24">
        <line x1="0" y1="12" x2="48" y2="12" />
        <polygon points="4,12 8,20 0,20" fill="currentColor" />
        <polygon points="24,12 28,20 20,20" fill="currentColor" />
        <circle cx="44" cy="16" r="4" />
      </svg>
    ),
  },
  {
    title: 'Cantilever Beams',
    description: 'Fixed-end beam analysis with moment and shear calculations.',
    icon: (
      <svg viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-12 w-24">
        <rect x="0" y="4" width="8" height="16" fill="currentColor" opacity="0.3" />
        <line x1="8" y1="12" x2="44" y2="12" />
        <line x1="36" y1="4" x2="36" y2="12" />
        <polygon points="36,4 32,8 40,8" fill="currentColor" />
      </svg>
    ),
  },
]

const methods = [
  {
    title: 'Equilibrium Equations',
    formula: 'ΣFx = 0, ΣFy = 0, ΣM = 0',
    description: 'Fundamental static equilibrium for determinate beams',
  },
  {
    title: 'Three-Moment Equation',
    formula: 'M₁L₁ + 2M₂(L₁+L₂) + M₃L₂ = -6(A₁ā₁/L₁ + A₂b̄₂/L₂)',
    description: 'For analyzing continuous beams over multiple supports',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-accent" />
                AI-Powered Engineering Assistant
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Master Beam Analysis with{' '}
                <span className="text-primary">CivilBot</span>
              </h1>
              <p className="max-w-lg text-pretty text-lg text-muted-foreground">
                Interactive beam analysis tool for civil engineering students. Learn equilibrium 
                and three-moment equation methods with step-by-step AI guidance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/analysis">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4" />
                    </svg>
                    Start Analysis
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/learn">Learn Methods</Link>
                </Button>
              </div>
            </div>

            {/* Beam Diagram Illustration */}
            <div className="relative rounded-xl border border-border bg-card p-8 shadow-lg">
              <svg viewBox="0 0 400 200" className="w-full" fill="none">
                {/* Beam */}
                <rect x="40" y="80" width="320" height="12" fill="currentColor" className="text-primary" rx="2" />
                
                {/* Left Support (Pinned) */}
                <polygon points="60,92 80,130 40,130" fill="currentColor" className="text-muted-foreground" />
                <line x1="30" y1="130" x2="90" y2="130" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
                
                {/* Right Support (Roller) */}
                <circle cx="340" cy="110" r="18" fill="currentColor" className="text-muted-foreground" />
                <line x1="310" y1="128" x2="370" y2="128" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
                
                {/* Point Load */}
                <line x1="200" y1="30" x2="200" y2="80" stroke="currentColor" strokeWidth="3" className="text-accent" />
                <polygon points="200,80 192,60 208,60" fill="currentColor" className="text-accent" />
                <text x="200" y="20" textAnchor="middle" fill="currentColor" className="text-accent text-sm font-medium">P = 50 kN</text>
                
                {/* Reactions */}
                <line x1="60" y1="150" x2="60" y2="110" stroke="currentColor" strokeWidth="2" className="text-chart-2" strokeDasharray="4" />
                <polygon points="60,110 54,124 66,124" fill="currentColor" className="text-chart-2" />
                <text x="60" y="165" textAnchor="middle" fill="currentColor" className="text-chart-2 text-xs">R₁</text>
                
                <line x1="340" y1="145" x2="340" y2="105" stroke="currentColor" strokeWidth="2" className="text-chart-2" strokeDasharray="4" />
                <polygon points="340,105 334,119 346,119" fill="currentColor" className="text-chart-2" />
                <text x="340" y="160" textAnchor="middle" fill="currentColor" className="text-chart-2 text-xs">R₂</text>
                
                {/* Dimensions */}
                <line x1="60" y1="180" x2="340" y2="180" stroke="currentColor" strokeWidth="1" className="text-muted-foreground" />
                <text x="200" y="195" textAnchor="middle" fill="currentColor" className="text-muted-foreground text-xs">L = 6m</text>
              </svg>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Interactive beam diagram with real-time analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beam Types Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Supported Beam Types</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Analyze various beam configurations with our comprehensive tools
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex justify-center text-primary">{feature.icon}</div>
                  <CardTitle className="text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Methods Section */}
      <section className="bg-secondary/50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Analysis Methods</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Learn and apply fundamental structural analysis methods
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {methods.map((method) => (
              <Card key={method.title} className="bg-card">
                <CardHeader>
                  <CardTitle>{method.title}</CardTitle>
                  <div className="rounded-md bg-muted px-4 py-3 font-mono text-sm text-foreground">
                    {method.formula}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{method.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CivilBot Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Meet CivilBot</h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Your AI-powered civil engineering assistant that guides you through every 
                step of beam analysis calculations.
              </p>
              <ul className="space-y-4">
                {[
                  'Step-by-step calculation guidance',
                  'Real-time error checking and feedback',
                  'Explanation of engineering concepts',
                  'Practice problems and solutions',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4 text-accent">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" size="lg">
                <Link href="/analysis">Try CivilBot Now</Link>
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-primary-foreground">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">CivilBot</p>
                  <p className="text-xs text-muted-foreground">AI Engineering Assistant</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-foreground">
                    How do I calculate the reactions for a simply supported beam with a point load?
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <p className="text-sm text-foreground">
                    Great question! For a simply supported beam with a point load P at distance a from the left support:
                  </p>
                  <div className="mt-2 rounded bg-muted px-3 py-2 font-mono text-xs">
                    R₁ = P(L-a)/L<br />
                    R₂ = Pa/L
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>CivilMadeEasy - Educational Tool for Civil Engineering Students</p>
        </div>
      </footer>
    </div>
  )
}
