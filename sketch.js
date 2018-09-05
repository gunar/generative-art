const DEBUG = false
const sx = 0
const sy = 0
const sw = 400
const sh = 400
const S = 3 // size
const SPACING = 2
const CX = sw/2
const CY = sh/2

const N_ROTATING = sw*0.5234532
const L_ROTATING = 100

const N_SHOOTING = sw/8
const L_SHOOTING = 100

const MAX_OPACITIY = 256

// Golden Ratio
const PHI = (1 + Math.sqrt(5)) / 2
const ALPHA = 2

const rand = x => random(-x,x)
const arr = x => Array.from({
	length: x
}, () => 0)

let pRotating, pShooting

function setup() {
	createCanvas(sw, sh)

	frameRate(30)

	background('#222')
  fill('#FFF5')
	noStroke()
  ellipseMode(CENTER)

  gShooting = createGraphics(sw, sh)
	gShooting.fill(255, 80)
	gShooting.noStroke()
  gShooting.ellipseMode(CENTER)

  getInitShooting = () => {
    const sTheta = random(0, 2*PI)
    const sR = random(0, sw/2)
    const dTheta = random(0, 2*PI)
    const dR = random(0, sh/2)
    return {
      sx: CX+sR*cos(sTheta),
      sy: CY+sR*sin(sTheta),
      dx: CX+dR*cos(dTheta),
      dy: CY+dR*sin(dTheta),
    }
  }
  pShooting = arr(N_SHOOTING)
    .map((_, k) => {
      return {
        ...getInitShooting(),
        t : floor(random(0, L_SHOOTING)),
        opacity: random(.5,1),
        s: random(0, S),
      }
    })


  gRotating = createGraphics(sw, sh)
	gRotating.fill(255, 80)
	gRotating.noStroke()
  gRotating.ellipseMode(CENTER)


  // sunflower seed arrangements http://demonstrations.wolfram.com/SunflowerSeedArrangements/
  // https://stackoverflow.com/questions/28567166/uniformly-distribute-x-points-inside-a-circle#28572551
  const radius = (k,n,b) => {
    if (k>n-b) return 1
    return sqrt(k-.5)/sqrt(n-(b+1)/2)
  }
  const n = N_ROTATING
  const b = round(ALPHA*sqrt(n)) // number of boundary points
  pRotating = arr(n)
    .map((_, k) => ({
      r: radius(k, n, b),
      theta: 2*PI*k/PHI^2,
      rotation: rand(PI/400),
      t: random(0, L_ROTATING),
      opacity: random(.5,1),
      s: random(0, S),
    }))
}

const limit = (i, lim) => i < lim ? i : lim

function draw() {
  clear()
  if (DEBUG) ellipse(CX, CY, sw, sh)
  text(frameCount,0,10)

  const initOpacity = () => limit(frameCount/50, 1)

  gRotating.clear()
  for (const p of pRotating) {
    p.theta += p.rotation
    p.t += 1
    if (p.t >= L_ROTATING) {
      p.t = 0
      // make particles appear in a different place
      p.theta = random(0, 2*PI)
    }
    const { r, theta } = p
    const x = CX*r*cos(theta)
    const y = CY*r*sin(theta)
    const lifetimeOpacity = () => {
      if (p.t < L_ROTATING*1/4) {
        return p.t/(L_ROTATING*1/4)
      } else if (p.t < L_ROTATING*3/4) {
        return 1
      }
      return (L_ROTATING-p.t)/(L_ROTATING*1/4)
    }
    gRotating.fill(255,MAX_OPACITIY*lifetimeOpacity()*initOpacity()*p.opacity)
    gRotating.ellipse(CX+x, CY+y, p.s, p.s)
  }
  copy(gRotating, 0, 0, sw, sh, 0, 0, sw, sh)

  gShooting.clear()
  for (const p of pShooting) {
    if (p.t === L_SHOOTING) {
      p.t = 0
      const { sx, sy, dx, dy } = getInitShooting()
      p.sx = sx
      p.sy = sy
      p.dx = dx
      p.dy = dy
    }
    p.t+=1
    const x = p.sx+(p.dx - p.sx)*p.t/L_SHOOTING
    const y = p.sy+(p.dy - p.sy)*p.t/L_SHOOTING

    const lifetimeOpacity = () => {
      if (p.t < L_SHOOTING*1/4) {
        return p.t/(L_SHOOTING*1/4)
      } else if (p.t < L_SHOOTING*3/4) {
        return 1
      }
      return (L_SHOOTING-p.t)/(L_SHOOTING*1/4)
    }
    gShooting.fill(255,MAX_OPACITIY*initOpacity()*lifetimeOpacity())
    gShooting.ellipse(x, y, p.s, p.s)
    if (DEBUG) {
      gShooting.fill('red')
      gShooting.ellipse(p.dx, p.dy, S, S)
      gShooting.fill('yellow')
      gShooting.ellipse(p.sx, p.sy, S, S)
    }
  }
  copy(gShooting, 0, 0, sw, sh, 0, 0, sw, sh)
}
