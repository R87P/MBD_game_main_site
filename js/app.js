kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

//speed identifier
const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
const FALL_DEATH = 400
const ENEMY_SPEED = 20

let isJumping = true


// game logic
// 5-9-2022 change Root to img folder and import custom images as sprites, use mario for time being to make app work 
loadRoot('/img/')
loadSprite('coin', 'coin.png')
loadSprite('evil-shroom', 'evilShroom.png')
loadSprite('brick', 'brick.png')
loadSprite('block', 'block.png')
loadSprite('mario', 'mario.png')
loadSprite('mushroom', 'mushroom.png')
loadSprite('surprise', 'surprise.png')
loadSprite('unboxed', 'unboxed.png')
loadSprite('pipe-top-left', 'pipeTopLeft.png')
loadSprite('pipe-top-right', 'pipeTopRight.png')
loadSprite('pipe-bottom-left', 'pipeBottomLeft.png')
loadSprite('pipe-bottom-right', 'pipeBottomRight.png')

loadSprite('blue-block', 'blueBlock.png')
loadSprite('blue-brick', 'blueBrick.png')
loadSprite('blue-steel', 'blueSteel.png')
loadSprite('blue-evil-shroom', 'blueEvilShroom.png')
loadSprite('blue-surprise', 'blueSurprise.png')


scene('game', ({ score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '                                      ',
            '     %   =*=%=                        ',
            '                                      ',
            '                            -+        ',
            '                    ^   ^   ()        ',
            '==============================   =====',
          ]
          // [
          //   '£                                       £',
          //   '£                                       £',
          //   '£                                       £',
          //   '£                                       £',
          //   '£                                       £',
          //   '£        @@@@@@              x x        £',
          //   '£                          x x x        £',
          //   '£                        x x x x  x   -+£',
          //   '£               z   z  x x x x x  x   ()£',
          //   '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
          // ]
    ]

    const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],
    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '£': [sprite('blue-brick'), solid(), scale(0.5)],
    'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
    '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
    'x': [sprite('blue-steel'), solid(), scale(0.5)],
    }

    const gameLevel = addLevel(maps, levelCfg)

    const scoreLabel = add([
      text(score),
      pos(30, 6),
      layer('ui'),
      {
        value:score,
      }
    ])

    add([text('level' + 'test', pos(4,6))])

    function big() {
      let timer = 0
      let isBig = false
      return {
        update() {
          if (isBig) {
            timer -= dt()
            if (timer <= 0) {
              this.smallify()
            }
          }
        },
        isBig() {
          return isBig
        },
        smallify() {
          this.scale = vec2(1)
          CURRENT_JUMP_FORCE = JUMP_FORCE
          timer = 0
          isBig = false
        },
        biggify() {
          this.scale = vec2(2)
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
          timer = time
          isBig = true
        }
      }
    }


    const player = add( [
      sprite('mario'), solid(), 
      pos(30,0),
      body(),
      big(),
      origin('bot')
    ])

    action('mushroom', (m) => {
      m.move(50, 0)
    })

    player.on('headbump', (obj) => {
      if (obj.is('coin-surprise')) {
        gameLevel.spawn('$', obj.gridPos.sub(0, 1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0,0))
      }
      if (obj.is('mushroom-surprise')) {
        gameLevel.spawn('#', obj.gridPos.sub(0, 1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0,0))
      }
    })

    player.collides('mushroom', (m) =>{
      destroy(m)
      player.biggify(6)
    })

    player.collides('coin', (c) => {
      destroy(c)
      scoreLabel.value++
      scoreLabel.text = scoreLabel.value
    })

    

action('dangerous', (d) => {
  d.move(-ENEMY_SPEED, 0)
})

    player.collides('dangerous', (d) => {
      if (isJumping) {
        destroy(d)
      } else {
        go('lose', { score: scoreLabel.value})
      }
   })

   player.action(() => {
     camPos(player.pos)
     if (player.pos.y >= FALL_DEATH) {
      go('lose', { score: scoreLabel.value})
     }
   })

   keyDown('left', () => {
     player.move(-MOVE_SPEED, 0)
   })

   keyDown('right', () => {
     player.move(MOVE_SPEED, 0)
   })

   player.action(() => {
    if (player.grounded()) {
      isJumping = false
    }
   })

   keyPress('space', () => {
     if (player.grounded()) {
       isJumping = true
       player.jump(CURRENT_JUMP_FORCE)
     }
   })



})

scene('lose', ({ score }) => {
  add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
})

start('game', { score: 0 })