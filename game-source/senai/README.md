# Ninja del castillo — adaptación para SENAI

Base: https://github.com/uheartbeast/metroidvania-godot-4
Commit original: 32b73e35851e0f6eb58ba2469b38e3d73daccd9a
Código y recursos originales: Copyright (c) 2023 Heart Gamedev LLC, licencia MIT incluida en ../LICENSE.txt.

Cambios de esta adaptación: atlas del ninja, espada, shuriken, orientación mediante movimiento, joystick multitáctil y botones de acción rotulados, controles de teclado y gamepad estándar (incluido DualSense cuando el navegador lo reconoce), menús en español navegables con control, guardado persistente en user://, fondo del catálogo y final jugable. Se mantienen mapas, enemigos, jefe, plataformas móviles, doble salto y salto en paredes de la base original.

Motor: Godot 4.3, exportación Web de un solo hilo, GL Compatibility. Instalar las plantillas oficiales de Godot 4.3 y copiar export_presets.example.cfg como export_presets.cfg. Exportar con `godot --headless --path game-source --export-release Web ../dist/game/engine.html`. Comprimir engine.wasm con gzip y conservar engine.wasm.gz en el servidor: la plantilla web_shell.html lo descomprime al cargar. El HTML envolvente del juego se encuentra en /game/index.html de la página publicada.

El atlas del ninja se conserva como PNG transparente original. Su lectura y alineación de pies se hace en ninja_visual.gd. El código original modificado sigue sujeto a MIT; los recursos añadidos del catálogo se usan para esta adaptación.
