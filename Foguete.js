const app = new PIXI.Application();
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const blueColor = 0xADD8E6; // Azul claro
const whiteColor = 0xFFFFFF; // Branco

async function init() {
    await app.init({ width: screenWidth, height: screenHeight });
    document.body.appendChild(app.view);
    await PIXI.Assets.load(['sample.png', 'bullet.png', 'et.png']);

    let sprite = PIXI.Sprite.from('sample.png');
    const scaleFactor = 0.5;
    sprite.scale.set(scaleFactor, scaleFactor);
    app.stage.addChild(sprite);
    sprite.x = app.screen.width / 2;
    sprite.y = app.screen.height / 2 + 150; // Mover o sprite para baixo

    let speed = 5;

    let mouseX = 0;
    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
    });

    app.ticker.add(() => {
        sprite.x += (mouseX - sprite.x) * 0.1;
        sprite.x = Math.max(0, Math.min(sprite.x, app.screen.width - sprite.width));
    });

    let img = PIXI.Sprite.from('et.png');
    app.stage.addChild(img);
    img.scale.set(0.5, 0.5);
    img.x = app.screen.width / 2;

    let direction = 1;
    app.ticker.add(() => {
        img.x += speed * direction;

        if (img.x <= 0 || img.x >= app.screen.width - sprite.width) {
            direction *= -1;
        }
    });

    let hits = 0;
    let shootingEnabled = true;
    let updateProjectile = null;
    let lastShotTime = 0; // Variável para rastrear o último tempo de tiro

    function detectCollision(projectile) {
        const dx = img.x + img.width / 2 - projectile.x - projectile.width / 2;
        const dy = img.y + img.height / 2 - projectile.y - projectile.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (img.width / 2 + projectile.width / 2) * 0.5) {
            app.stage.removeChild(projectile);
            hits++;

            if (hits >= 5) {
                app.stage.removeChild(img);
                app.ticker.remove(updateProjectile);
                shootingEnabled = false;
                document.removeEventListener('click', shoot);
                showQuestion();
            }
            return true;
        }
        return false;
    }

    function shoot() {
        if (!shootingEnabled) return;
     
        const soundTiro = new Howl({
            src: ['8bit_gunloop_explosion.mp3'],
        });

        soundTiro.play();
        const now = Date.now();

        // Verifica se passou mais de 1 segundo desde o último tiro
        if (now - lastShotTime < 1000) return;

        lastShotTime = now;

        const projectile = new PIXI.Sprite(PIXI.Texture.from('bullet.png'));
        projectile.x = sprite.x + (sprite.width / 2);
        projectile.y = sprite.y - (sprite.height / -16);
        projectile.vx = 0;
        projectile.vy = -10;
        app.stage.addChild(projectile);

        updateProjectile = function() {
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;

            if (projectile.x < 0 || projectile.x > app.screen.width ||
                projectile.y < 0 || projectile.y > app.screen.height) {
                app.stage.removeChild(projectile);
            } else {
                if (detectCollision(projectile)) {
                    app.ticker.remove(updateProjectile);
                }
            }
        };

        app.ticker.add(updateProjectile);
    }
    document.addEventListener('click', shoot);


    const sound = new Howl({
        src: ['delayed_chips.mp3'],
        loop: true,
    });

    sound.play();
}

function showQuestion() {
    const questionContainer = new PIXI.Container(); // Container para a pergunta e alternativas
    questionContainer.position.set(app.screen.width / 2, app.screen.height / 2 - 200); // Posição centralizada
    app.stage.addChild(questionContainer);

    const questionBackground = new PIXI.Graphics(); // Fundo branco para a pergunta e alternativas
    questionBackground.beginFill(0xFFFFFF);
    questionBackground.drawRect(-200, -50, 450, 250); // Dimensões da "tabela" da pergunta e alternativas
    questionBackground.endFill();
    questionContainer.addChild(questionBackground);

    const questionText = new PIXI.Text('Qual é a capital da França?', { fill: 'black', fontSize: 24 }); // Texto preto para a pergunta
    questionText.anchor.set(0.5);
    questionText.position.set(0, -40); // Ajuste da posição da pergunta
    questionContainer.addChild(questionText);

    const options = ['Berlim', 'Londres', 'Madrid', 'Paris'];
    const optionButtons = [];

    for (let i = 0; i < options.length; i++) {
        const button = new PIXI.Text(options[i], { fill: 'black', fontSize: 18 }); // Cor preta para as alternativas
        button.anchor.set(0.5);
        button.interactive = true;
        button.buttonMode = true;
        button.position.set(0, i * 50 + 20); // Ajuste da posição das alternativas

        button.on('pointerdown', () => {
            checkAnswer(options[i]);
            app.stage.removeChild(questionContainer);
        });
        questionContainer.addChild(button);
        optionButtons.push(button);
    }
}

function checkAnswer(answer) {
    if (answer === 'Paris') {
        alert('Resposta Certa, parabens!');
        location.reload();
    } else {
        alert('Resposta incorreta. Tente novamente!');
        location.reload();
    }
}


init();
