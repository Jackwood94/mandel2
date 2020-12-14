PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
//PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
window.app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight
//  resolution: 1
})

document.querySelector('#frame').appendChild(app.view)

fragment = `
precision mediump float;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform sampler2D uSampler;
uniform float time;
uniform float screenWidth;
uniform float screenHeight;
uniform float screenX;
uniform float screenY;
void main(void)
{
  gl_FragColor = vec4(0, 0, 0, 1.0);

  float x = screenX + screenWidth * (vTextureCoord.x - 0.5);
  float y = screenY + screenHeight * (vTextureCoord.y - 0.5);
  float zx = 0.0;
  float zy = 0.0;
  float zswap;
  float color;

  for(int i=0; i <= 100; i++) {
    zswap = zx*zx - zy*zy + x;
    zy = 2.0*zx*zy + y;
    zx = zswap;

    if (abs(zx)+abs(zy) > 2.0) {
      color=float(i)/100.0;
      gl_FragColor = vec4(color, color, color, 1.0);
      return;
    }
  }
}

`

screenSize = 2;

filter = new PIXI.Filter(null, fragment, {
  // NB: these values get immediately overwritten
  screenWidth: screenSize,
  screenHeight: screenSize,
  screenX: -0.5,
  screenY: 0
});

app.stage.filterArea = app.renderer.screen;
app.stage.filters = [filter];

// Resize function window
resize = function(){
  // Get the parent
  parent = app.view.parentNode;

  // Resize the renderer
  app.renderer.resize(window.innerWidth, window.innerHeight);

  // Scale the renderer to fit 128x128 plus extra on the bottom or right
  narrowest = Math.min(parent.clientWidth, parent.clientHeight);
  //app.stage.scale.set(narrowest / (80 + MARGIN_PIXELS * 2));

  if (parent.clientWidth < parent.clientHeight) {
    filter.uniforms.screenWidth = screenSize;
    filter.uniforms.screenHeight = screenSize * parent.clientHeight/parent.clientWidth;
  } else {
    filter.uniforms.screenWidth = screenSize * parent.clientWidth/parent.clientHeight;
    filter.uniforms.screenHeight = screenSize;
  }
}
// Listen for window resize events
window.addEventListener('resize', resize);

resize()
