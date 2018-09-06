/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

function LinearEasing (x) {
  return x;
}

function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  for (var i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};

// https://easings.net/
// https://github.com/gre/bezier-easing
const easeInQuart = bezier(0.165, 0.84, 0.44, 1)

const DEBUG = false
const sx = 0
const sy = 0
const sw = 600
const sh = 600
const S = 3.5 // size
const SPACING = 2
const CX = sw/2
const CY = sh/2

const N_ROTATING = sw*0.8654
const L_ROTATING = 100

const N_SHOOTING = sw*0.3423
const L_SHOOTING = 100

const MAX_OPACITIY = 256

// Golden Ratio
const PHI = (1 + Math.sqrt(5)) / 2
const ALPHA = 5

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
      s: random(0, S)
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
    const life = p.t/L_ROTATING
    const lifeRad = life*PI
    const size = max(0.5,sin(lifeRad))*p.s
    const opacity = sin(lifeRad)*MAX_OPACITIY*initOpacity()*p.opacity
    gRotating.fill(255,opacity)
    gRotating.ellipse(CX+x, CY+y, size, size)
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
    const life = p.t/L_SHOOTING
    const lifeRad = life*PI
    const eased = easeInQuart(life)
    const x = p.sx+(p.dx - p.sx)*eased
    const y = p.sy+(p.dy - p.sy)*eased

    const lifetimeOpacity = () => {
      if (p.t < L_SHOOTING*1/4) {
        return p.t/(L_SHOOTING*1/4)
      } else if (p.t < L_SHOOTING*3/4) {
        return 1
      }
      return (L_SHOOTING-p.t)/(L_SHOOTING*1/4)
    }
    const opacity = sin(lifeRad)*MAX_OPACITIY*initOpacity()
    gShooting.fill(255,opacity)
    const size = max(0.5,sin(lifeRad))*p.s
    gShooting.ellipse(x, y, size, size)

    if (DEBUG) {
      gShooting.fill('red')
      gShooting.ellipse(p.dx, p.dy, S, S)
      gShooting.fill('yellow')
      gShooting.ellipse(p.sx, p.sy, S, S)
    }
  }
  copy(gShooting, 0, 0, sw, sh, 0, 0, sw, sh)
}
