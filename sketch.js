const sx = 0
const sy = 0
const sw = 400
const sh = 400
const S = 3 // size
const N_PARTICLES = 300
const SPACING = 2
const CX = sw/2
const CY = sh/2

const LIFETIME = 100

// Golden Ratio
const PHI = (1 + Math.sqrt(5)) / 2
const ALPHA = 2

const arr = x => Array.from({
	length: x
}, () => 0)

let particles

function setup() {
	createCanvas(sw, sh)

	frameRate(30)

	background('#222')
  fill('#FFF5')
	noStroke()
	rectMode(CENTER)
  ellipseMode(CENTER)



  rotating = createGraphics(sw, sh)
	rotating.fill(255, 80)
	rotating.noStroke()
  // sunflower seed arrangements http://demonstrations.wolfram.com/SunflowerSeedArrangements/
  // https://stackoverflow.com/questions/28567166/uniformly-distribute-x-points-inside-a-circle#28572551
  const radius = (k,n,b) => {
    if (k>n-b) return 1
    return sqrt(k-.5)/sqrt(n-(b+1)/2)
  }
  const rand = x => random(-x,x)
  const n = sw*0.4234532
  const b = round(ALPHA*sqrt(n)) // number of boundary points
  particles = arr(n)
    .map((_, k) => ({
      r: radius(k, n, b),
      // theta: k < CX/4 ? CX : CX-(k-CX/4)^2,
      theta: 2*PI*k/PHI^2,
      rotation: rand(PI/400),
      t: random(0, LIFETIME),
    }))
}

const limit = (i, lim) => i < lim ? i : lim

function draw() {
  clear()
  rotating.clear()
  text(frameCount,0,10)
  for (const p of particles) {
    p.theta += p.rotation
    p.t += 1
    if (p.t >= LIFETIME) {
      p.t = 0
      // make particles appear in a different place
      p.theta = random(0, 2*PI)
    }
    const { r, theta } = p
    const x = CX*r*cos(theta)
    const y = CY*r*sin(theta)
    const transparency = f => {
      const maxOpacity = 200
      if (p.t < LIFETIME*1/4) {
        return p.t*maxOpacity/(LIFETIME*1/4)
      } else if (p.t < LIFETIME*3/4) {
        return maxOpacity
      }
      return (LIFETIME-p.t)*maxOpacity/(LIFETIME*1/4)
    }
    rotating.fill(255,transparency(frameCount))
    rotating.ellipse(CX+x, CY+y, S, S)
  }
  copy(rotating, 0, 0, sw, sh, 0, 0, sw, sh)
}
