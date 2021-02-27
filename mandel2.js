PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
//PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
window.app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight
//  resolution: 1
})

document.querySelector('#frame').appendChild(app.view);

const MAX_ITERATIONS=200;
const COLOR_CYCLES=10;

const buttonsSpritesheetData = {
  "frames":
  {
    "plus":
    {
      "frame": {"x":0,"y":0,"w":8,"h":8},
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": {"x":0,"y":0,"w":8,"h":8},
      "sourceSize": {"w":8,"h":8},
      "anchor": {"x":0.5,"y":0.5}
    },
    "minus":
    {
      "frame": {"x":8,"y":0,"w":8,"h":8},
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": {"x":0,"y":0,"w":8,"h":8},
      "sourceSize": {"w":8,"h":8},
      "anchor": {"x":0.5,"y":0.5}
    },
    "up":
    {
      "frame": {"x":16,"y":0,"w":8,"h":8},
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": {"x":0,"y":0,"w":8,"h":8},
      "sourceSize": {"w":8,"h":8},
      "anchor": {"x":0.5,"y":0.5}
    },
    "down":
    {
      "frame": {"x":24,"y":0,"w":8,"h":8},
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": {"x":0,"y":0,"w":8,"h":8},
      "sourceSize": {"w":8,"h":8},
      "anchor": {"x":0.5,"y":0.5}
    },
    "left":
    {
      "frame": {"x":32,"y":0,"w":8,"h":8},
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": {"x":0,"y":0,"w":8,"h":8},
      "sourceSize": {"w":8,"h":8},
      "anchor": {"x":0.5,"y":0.5}
    },
    "right":
    {
      "frame": {"x":40,"y":0,"w":8,"h":8},
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": {"x":0,"y":0,"w":8,"h":8},
      "sourceSize": {"w":8,"h":8},
      "anchor": {"x":0.5,"y":0.5}
    }
  },
  "meta":
  {
    "app": "https://www.codeandweb.com/texturepacker",
    "version": "1.0",
    "image": "buttons.png",
    "format": "RGBA8888",
    "size": {"w":48,"h":8},
    "scale": "1",
    "smartupdate": "$TexturePacker:SmartUpdate:5c89c061071a0c52b3956690ead5a36a:521fbf963877ca6e4aebf698fe8142c2:b34c8670b11bb20cb1751a70d3683e22$"
  }
}


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

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void)
{
  gl_FragColor = vec4(0, 0, 0, 1.0);

  float x = screenX + screenWidth * (vTextureCoord.x - 0.5);
  float y = screenY + screenHeight * (vTextureCoord.y - 0.5);
  float zx = 0.0;
  float zy = 0.0;
  float zswap;
  float scaled;
  float ax;
  float ay;
  //gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);

  for(int i=0; i <= ${MAX_ITERATIONS}; i++) {
    zswap = zx*zx - zy*zy + x;
    zy = (zx+zx)*zy + y;
    zx = zswap;
    ax = abs(zx);
    ay = abs(zy);

    // TODO: having trouble with optimizing away the core of the bulb here..
    // if (abs(-.2-zx) < 0.1 && ay < .1) {
    //   gl_FragColor = vec4(0., 0., 0., 1.0);
    //   return;
    // }

    if (ax > 2.0 || ay > 2.0) {
      scaled=float(i)/${MAX_ITERATIONS}.;
      gl_FragColor = vec4(
        hsv2rgb(
          vec3(
            mod(
              scaled,
              1./${COLOR_CYCLES}.
            )*${COLOR_CYCLES}.,
            1.,
            .5+scaled/4.
          )
        ), 1.0
      );
      return;
    }
  }
}

`

var screenSize = 2;

const container = new PIXI.Container();
container.filterArea = new PIXI.Rectangle(0, 0, 80, 80);
app.stage.addChild(container);
const filter = new PIXI.Filter(null, fragment, {
  // NB: these values get immediately overwritten
  screenWidth: screenSize,
  screenHeight: screenSize,
  screenX: -0.5,
  screenY: 0
});
container.filters = [filter];

// app.stage.filterArea = app.renderer.screen;
// app.stage.filters = [filter];


const baseTexture = new PIXI.BaseTexture(buttonsSpritesheetData.meta.image, null, 1);
const spritesheet = new PIXI.Spritesheet(baseTexture, buttonsSpritesheetData);
spritesheet.parse(function (textures) {
   // finished preparing spritesheet textures
});
const controls={};
const controlNames=["plus","minus","up","down","left","right"]
for(i=0; i<controlNames.length; i++){
  const name = controlNames[i];
  controls[name] = new PIXI.Sprite(spritesheet.textures[name]);
  app.stage.addChild(controls[name]);
  controls[name].interactive = true;
  controls[name].buttonMode = true;

  controls[name]
    .on('pointerdown', function() { controls[name].isDown = true })
    .on('pointerup', function() { controls[name].isDown = false })
    .on('pointerupoutside', function() { controls[name].isDown = false });
}

const minScreenSize = 70;

centerArrowsAt = function(x, y) {
  controls.up.position.set(x,y-8);
  controls.down.position.set(x,y+8);
  controls.left.position.set(x-8,y);
  controls.right.position.set(x+8,y);
}

// Resize function window
resize = function(){
  // Get the parent
  parent = app.view.parentNode;

  // Resize the renderer
  app.renderer.resize(window.innerWidth, window.innerHeight);

  // Scale the renderer to fit 128x128 plus extra on the bottom or right
  var narrowest = Math.min(parent.clientWidth, parent.clientHeight);
  var widest = Math.max(parent.clientWidth, parent.clientHeight);
  app.stage.scale.set(narrowest / minScreenSize);
  const maxScreenSize = minScreenSize * widest / narrowest;

  if (parent.clientWidth < parent.clientHeight) {
    // portrait
    var screenWidth = screenSize;
    var screenHeight = screenSize * parent.clientHeight/parent.clientWidth;
    controls.plus.position.set(minScreenSize - 8, maxScreenSize - 8);
    controls.minus.position.set(minScreenSize - 20, maxScreenSize - 8);
    centerArrowsAt(12, maxScreenSize - 12);
  } else {
    // landscape
    var screenWidth = screenSize * parent.clientWidth/parent.clientHeight;
    var screenHeight = screenSize;
    controls.plus.position.set(maxScreenSize - 8, 8);
    controls.minus.position.set(maxScreenSize - 8, 20);
    centerArrowsAt(maxScreenSize - 12, minScreenSize - 12);
  }
  filter.uniforms.screenWidth = screenWidth;
  filter.uniforms.screenHeight = screenHeight;
  container.filterArea.width=Math.ceil(parent.clientWidth);
  container.filterArea.height=Math.ceil(parent.clientHeight);
}
// Listen for window resize events
window.addEventListener('resize', resize);

resize()

const zoomRatio = 1.02;
const panRatio = 0.01;

app.ticker.add(function(deltaT) {
  if(controls.plus.isDown) {
    screenSize/= zoomRatio;
    resize();
  }
  if(controls.minus.isDown) {
    screenSize*= zoomRatio;
    resize();
  }
  if(controls.up.isDown) {
    filter.uniforms.screenY-= screenSize*panRatio;
  }
  if(controls.down.isDown) {
    filter.uniforms.screenY+= screenSize*panRatio;
  }
  if(controls.left.isDown) {
    filter.uniforms.screenX-= screenSize*panRatio;
  }
  if(controls.right.isDown) {
    filter.uniforms.screenX+= screenSize*panRatio;
  }
});
