const sx = 0;
const sy = 0;
const sw = 400;
const sh = 400;
const sqSize = 20;
const SPACING = 2;
const arr = x => Array.from({
	length: x
}, () => 0)
const PULL = 1/1000
const translation =
  // x
	arr(sw / sqSize)
  // y
	  .map((_,x) => arr(sh / sqSize)
	//   [translationX,translationY,rotation,size]
		  .map((_,y) => ({
			  translationX: x*sw/sqSize,
			  translationY: y*sh/sqSize,
			  rotation: 0,
			  size: Math.random()*sqSize+10,
		})))

function setup() {
	createCanvas(sw, sh)

	frameRate(30)

	background(220)
	fill('blue')
	noStroke()
	rectMode(CENTER)

  mask = createGraphics(sw, sh);
	mask.fill('white')
	mask.clear()
	mask.noStroke()


  extra = createGraphics(sw, sh);
	extra.fill('white')
	extra.noStroke()
}

function draw() {
	clear()

	mask.clear()
	mask.background('black')
	mask.ellipse(sw/2, sh/2, sw*3/4)

	extra.clear()
	const k = sqSize;
	for (let i = 0; i < sw / k; i++) {
		for (let j = 0; j < sh / k; j++) {
			if (!(i % SPACING) && !(j % SPACING)) {
				translation[i][j].translationX += (noise(i,j,frameCount*0.03))*10*(noise(i, j, frameCount * 0.005) - .5)
				translation[i][j].translationX -= (translation[i][j].translationX-sw/2)*PULL

				translation[i][j].translationY += (noise(i,j,frameCount*0.03 -200))*10*(noise(i, j, frameCount * 0.005 -200) - .5)
				translation[i][j].translationY -= (translation[i][j].translationY-sh/2)*PULL

				translation[i][j].rotation += .5*(noise(i,j,frameCount*0.005 +200)-.5)
				const t = translation[i][j]
				push()
				translate(t.translationX, t.translationY)
				rotate(translation[i][j].rotation)
				rect(0, 0, t.size, t.size)
				pop()
			  //extra.rect(t[0]+i*k, t[1]+j*k, k, k)
			}
		}
	}
	blend(mask, sx, sy, sw, sh, sx, sy, sw, sh, MULTIPLY)
	//copy(extra, sx, sy, sw, sh, sx, sy, sw, sh)
}
