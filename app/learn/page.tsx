import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const topics = [
  {
    title: 'Equilibrium Equations',
    description: 'Foundation of structural analysis',
    content: `The three equations of static equilibrium form the basis for analyzing determinate structures:

**Sum of Horizontal Forces:**
ΣFx = 0

**Sum of Vertical Forces:**
ΣFy = 0

**Sum of Moments:**
ΣM = 0

These equations state that for a structure in equilibrium, the sum of all forces and moments must equal zero.`,
    formula: 'ΣFx = 0, ΣFy = 0, ΣM = 0',
  },
  {
    title: 'Three-Moment Equation',
    description: 'Analysis of continuous beams',
    content: `The three-moment equation (Clapeyron's theorem) is used to analyze continuous beams with multiple spans:

**General Form:**
M₁L₁ + 2M₂(L₁+L₂) + M₃L₂ = -6(A₁ā₁/L₁ + A₂b̄₂/L₂)

**Where:**
- M₁, M₂, M₃ = Bending moments at three consecutive supports
- L₁, L₂ = Span lengths
- A₁, A₂ = Areas under the free BMD
- ā₁, b̄₂ = Centroidal distances

This equation relates the moments at three consecutive supports, allowing us to solve for unknown moments in indeterminate beams.`,
    formula: 'M₁L₁ + 2M₂(L₁+L₂) + M₃L₂ = -6(A₁ā₁/L₁ + A₂b̄₂/L₂)',
  },
  {
    title: 'Shear Force Diagrams',
    description: 'Visualizing internal shear',
    content: `Shear Force Diagrams (SFD) show the internal shear force along the length of a beam:

**Key Concepts:**
- Shear force is the algebraic sum of transverse forces to one side of a section
- Point loads cause sudden jumps in the SFD
- Distributed loads cause linear changes in shear

**Sign Convention:**
- Positive shear: Left side up, right side down
- Negative shear: Left side down, right side up

**Relationship with Loading:**
dV/dx = -w(x)

Where w(x) is the distributed load intensity.`,
    formula: 'dV/dx = -w(x)',
  },
  {
    title: 'Bending Moment Diagrams',
    description: 'Understanding internal moments',
    content: `Bending Moment Diagrams (BMD) show the internal bending moment along a beam:

**Key Concepts:**
- The moment at any section equals the algebraic sum of moments of forces to one side
- Maximum moment occurs where shear force is zero
- The BMD is the integral of the SFD

**Sign Convention:**
- Positive moment: Sagging (tension at bottom)
- Negative moment: Hogging (tension at top)

**Relationships:**
dM/dx = V (moment is integral of shear)
d²M/dx² = -w (moment related to loading)`,
    formula: 'dM/dx = V, M = ∫V dx',
  },
  {
    title: 'Support Types',
    description: 'Understanding boundary conditions',
    content: `Different supports provide different restraints:

**Pinned Support (Hinge):**
- Resists horizontal and vertical forces
- Allows rotation
- Two reaction components (Rx, Ry)

**Roller Support:**
- Resists force perpendicular to rolling surface
- Allows horizontal movement and rotation
- One reaction component (Ry)

**Fixed Support (Built-in):**
- Resists all forces and moments
- No movement or rotation allowed
- Three reaction components (Rx, Ry, M)

**Free End:**
- No restraints
- Zero reactions, shear, and moment`,
    formula: 'Pinned: Rx, Ry | Roller: Ry | Fixed: Rx, Ry, M',
  },
  {
    title: 'Load Types',
    description: 'Different loading conditions',
    content: `Beams can be subjected to various types of loads:

**Point Load (Concentrated):**
- Acts at a single point
- Measured in kN or N
- Causes discontinuity in shear diagram

**Distributed Load (UDL/VDL):**
- Spread over a length
- Measured in kN/m or N/m
- UDL: Uniform intensity
- VDL: Varying intensity (triangular, trapezoidal)

**Moment Load (Couple):**
- Pure rotation applied at a point
- Measured in kNm or Nm
- Causes discontinuity in moment diagram

**Combined Loading:**
Real structures often have combinations of all load types.`,
    formula: 'Point: P (kN) | Distributed: w (kN/m) | Moment: M (kNm)',
  },
]

export default function LearnPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground">Learn Beam Analysis</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Master the fundamental concepts of structural beam analysis used in civil engineering.
            </p>
          </div>

          {/* Topics Grid */}
          <div className="space-y-8">
            {topics.map((topic, index) => (
              <Card key={topic.title} id={topic.title.toLowerCase().replace(/\s+/g, '-')}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted px-4 py-3">
                    <code className="font-mono text-sm text-foreground">{topic.formula}</code>
                  </div>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {topic.content.split('\n\n').map((paragraph, pIndex) => (
                      <div key={pIndex} className="mb-4">
                        {paragraph.split('\n').map((line, lIndex) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <p key={lIndex} className="font-semibold text-foreground">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            )
                          }
                          if (line.startsWith('- ')) {
                            return (
                              <p key={lIndex} className="ml-4">
                                {line}
                              </p>
                            )
                          }
                          return <p key={lIndex}>{line}</p>
                        })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl bg-primary/5 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to Practice?</h2>
            <p className="mb-6 text-muted-foreground">
              Apply these concepts with our interactive beam analysis tool and CivilBot guidance.
            </p>
            <Button asChild size="lg">
              <Link href="/analysis">Start Analyzing</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>CivilMadeEasy - Educational Tool for Civil Engineering Students</p>
        </div>
      </footer>
    </div>
  )
}
