# SENAI integration, 2026. Original base: Heart Gamedev LLC, MIT.
extends Node

var controls: Control
var zone_label: Label
var toast: Label
var toast_timer = 0.0
var won = false
var title_text: Label
var web_mute_callback
var joystick: Node2D
var stick_axis = 0.0
var translations = {"Start Game": "Nueva partida", "Load Game": "Continuar", "Quit": "Volver al inicio", "GAME OVER": "HAS CAIDO", "GAME PAUSED": "EN PAUSA", "Resume Game": "Continuar", "Main Menu": "Menu principal"}

func _ready():
	process_mode = Node.PROCESS_MODE_ALWAYS
	AudioServer.set_bus_volume_db(0, -10.0)
	if OS.has_feature("web"):
		web_mute_callback = JavaScriptBridge.create_callback(_set_web_mute)
		JavaScriptBridge.get_interface("window").senaiSetMuted = web_mute_callback
		JavaScriptBridge.eval("window.parent.postMessage({type:'senai-ready'}, window.location.origin)")
	bind_key("jump", KEY_SPACE)
	bind_key("jump", KEY_UP)
	bind_key("fire", KEY_K)
	bind_key("fire_missile", KEY_L)
	bind_key("sword", KEY_J)
	for action in ["fire", "fire_missile"]:
		for event in InputMap.action_get_events(action):
			if event is InputEventMouseButton:
				InputMap.action_erase_event(action, event)
	setup_gamepad()
	Input.joy_connection_changed.connect(_on_joy_connection)
	get_tree().node_added.connect(_on_node_added)
	var background = CanvasLayer.new()
	background.layer = -100
	add_child(background)
	var image = TextureRect.new()
	image.texture = preload("res://senai/castle.jpg")
	image.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	image.modulate = Color(0.35, 0.28, 0.42)
	image.mouse_filter = Control.MOUSE_FILTER_IGNORE
	background.add_child(image)
	image.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var ui = CanvasLayer.new()
	ui.layer = 100
	add_child(ui)
	controls = Control.new()
	controls.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(controls)
	controls.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	joystick = Node2D.new()
	joystick.set_script(preload("res://senai/virtual_stick.gd"))
	joystick.position = Vector2(49, 146)
	controls.add_child(joystick)
	add_control("ESPADA", Vector2(220, 112), "sword")
	add_control("SHURIKEN", Vector2(268, 112), "fire")
	add_control("SALTAR", Vector2(220, 145), "jump")
	add_control("ESPECIAL", Vector2(268, 145), "fire_missile")
	var pause_button = Button.new()
	pause_button.text = "PAUSA"
	pause_button.position = Vector2(275, 3)
	pause_button.size = Vector2(41, 18)
	pause_button.focus_mode = Control.FOCUS_NONE
	pause_button.pressed.connect(func():
		var world = MainInstances.world
		if is_instance_valid(world):
			var menu = world.get_node("UI/PauseMenu")
			menu.paused = not menu.paused
			release_inputs()
	)
	controls.add_child(pause_button)
	zone_label = Label.new()
	zone_label.position = Vector2(112, 5)
	zone_label.add_theme_font_size_override("font_size", 7)
	controls.add_child(zone_label)
	toast = Label.new()
	toast.position = Vector2(85, 92)
	toast.add_theme_font_size_override("font_size", 7)
	toast.modulate = Color("ffe0a0")
	controls.add_child(toast)
	get_tree().root.focus_exited.connect(_on_focus_lost)
	get_tree().root.mouse_exited.connect(func():
		if joystick.mouse_drag: joystick.reset()
	)

func bind_key(action, code):
	if not InputMap.has_action(action):
		InputMap.add_action(action)
	var event = InputEventKey.new()
	event.physical_keycode = code
	InputMap.action_add_event(action, event)

func _set_web_mute(arguments):
	if arguments.size() > 0:
		AudioServer.set_bus_mute(0, bool(arguments[0]))

func setup_gamepad():
	bind_pad_button("jump", JOY_BUTTON_A)
	bind_pad_button("sword", JOY_BUTTON_X)
	bind_pad_button("fire", JOY_BUTTON_B)
	bind_pad_button("fire_missile", JOY_BUTTON_Y)
	bind_pad_button("pause", JOY_BUTTON_START)
	bind_pad_button("move_left", JOY_BUTTON_DPAD_LEFT)
	bind_pad_button("move_right", JOY_BUTTON_DPAD_RIGHT)
	bind_pad_button("crouch", JOY_BUTTON_DPAD_DOWN)
	bind_pad_button("ui_accept", JOY_BUTTON_A)
	bind_pad_axis("move_left", JOY_AXIS_LEFT_X, -1.0)
	bind_pad_axis("move_right", JOY_AXIS_LEFT_X, 1.0)
	bind_pad_axis("ui_up", JOY_AXIS_LEFT_Y, -1.0)
	bind_pad_axis("ui_down", JOY_AXIS_LEFT_Y, 1.0)

func bind_pad_button(action, code):
	if not InputMap.has_action(action): InputMap.add_action(action)
	var event = InputEventJoypadButton.new()
	event.device = -1
	event.button_index = code
	InputMap.action_add_event(action, event)

func bind_pad_axis(action, axis, value):
	InputMap.action_set_deadzone(action, 0.22)
	var event = InputEventJoypadMotion.new()
	event.device = -1
	event.axis = axis
	event.axis_value = value
	InputMap.action_add_event(action, event)

func movement_axis():
	return clampf(Input.get_axis("move_left", "move_right") + stick_axis, -1.0, 1.0)

func _on_joy_connection(_device, connected):
	if connected:
		notify("Control conectado: X salta, cuadrado ataca.")
	else:
		release_inputs()
		if is_instance_valid(MainInstances.world):
			MainInstances.world.get_node("UI/PauseMenu").paused = true
		notify("Control desconectado. Juego en pausa.")

func add_control(text, position_value, action, width = 44):
	var panel = Panel.new()
	panel.position = position_value
	panel.size = Vector2(width, 29)
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.16, 0.10, 0.23, 0.92)
	style.border_color = Color("c499ad")
	style.set_border_width_all(1)
	style.set_corner_radius_all(5)
	panel.add_theme_stylebox_override("panel", style)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	controls.add_child(panel)
	var label = Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.size = panel.size
	label.add_theme_font_size_override("font_size", 7)
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(label)
	var button = TouchScreenButton.new()
	button.position = position_value + Vector2(width / 2.0, 14.5)
	var shape = RectangleShape2D.new()
	shape.size = Vector2(width, 29)
	button.shape = shape
	button.action = action
	button.visibility_mode = TouchScreenButton.VISIBILITY_ALWAYS
	button.passby_press = false
	button.pressed.connect(func(): style.bg_color = Color("85516a"))
	button.released.connect(func(): style.bg_color = Color(0.16, 0.10, 0.23, 0.92))
	controls.add_child(button)

func release_inputs():
	if is_instance_valid(joystick): joystick.reset()
	for action in ["move_left", "move_right", "jump", "sword", "fire", "fire_missile", "crouch"]:
		Input.action_release(action)

func _on_focus_lost():
	release_inputs()
	if is_instance_valid(MainInstances.world) and MainInstances.player is Player:
		MainInstances.world.get_node("UI/PauseMenu").paused = true

func _on_node_added(node):
	if node is Button or node is Label:
		translate_node.call_deferred(node)
	if node.name == "StartMenu":
		decorate_menu.call_deferred(node)
	if node.name == "SaveStation":
		node.modulate = Color("f6cf85")

func translate_node(node):
	if not is_instance_valid(node): return
	if translations.has(node.text):
		node.text = translations[node.text]
	if node is Button and node.name == "LoadButton":
		node.disabled = not FileAccess.file_exists(SaveManager.save_path)
	if node is Button:
		var focus_style = StyleBoxFlat.new()
		focus_style.bg_color = Color(0, 0, 0, 0)
		focus_style.border_color = Color("ffd18a")
		focus_style.set_border_width_all(1)
		node.add_theme_stylebox_override("focus", focus_style)
	if node is ColorRect:
		node.color = Color(0.04, 0.03, 0.09, 0.92)

func decorate_menu(menu):
	won = false
	var box = menu.get_node("CenterContainer/VBoxContainer")
	var label = Label.new()
	label.text = "NINJA DEL CASTILLO"
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 12)
	label.modulate = Color("ffcf87")
	box.add_child(label)
	box.move_child(label, 0)
	var hint = Label.new()
	hint.text = "Tres zonas. Un guardian. Tu camino."
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint.add_theme_font_size_override("font_size", 6)
	box.add_child(hint)
	box.move_child(hint, 1)
	menu.color = Color(0.04, 0.03, 0.09, 0.8)
	menu.get_node("CenterContainer/VBoxContainer/QuitButton").hide()
	menu.get_node("CenterContainer/VBoxContainer/StartButton").grab_focus()

func _process(delta):
	var playing = is_instance_valid(MainInstances.player) and is_instance_valid(MainInstances.level)
	controls.visible = playing and not won
	if playing:
		var path = MainInstances.level.scene_file_path
		zone_label.text = "EL VESTIBULO" if "one" in path else "EL GUARDIAN" if "two" in path else "LA SALIDA"
		if "two" in path and MainInstances.level.has_node("BossEnemy"):
			var boss = MainInstances.level.get_node("BossEnemy")
			zone_label.text = "GUARDIAN  " + str(boss.stats.health) + "/" + str(boss.stats.max_health)
	toast_timer = maxf(0, toast_timer - delta)
	toast.visible = toast_timer > 0

func notify(text):
	toast.text = text
	toast_timer = 3.0

func release_sword_target(target):
	await get_tree().create_timer(0.4, false).timeout
	if is_instance_valid(target): target.remove_meta("senai_sword")

func victory():
	if won: return
	won = true
	release_inputs()
	get_tree().paused = true
	var layer = CanvasLayer.new()
	layer.layer = 120
	layer.process_mode = Node.PROCESS_MODE_ALWAYS
	get_tree().current_scene.add_child(layer)
	var panel = ColorRect.new()
	panel.color = Color(0.04, 0.03, 0.09, 0.95)
	layer.add_child(panel)
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var box = VBoxContainer.new()
	box.position = Vector2(65, 55)
	box.size = Vector2(190, 70)
	panel.add_child(box)
	var label = Label.new()
	label.text = "CASTILLO SUPERADO\nEl ninja encontro la salida."
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 10)
	box.add_child(label)
	var button = Button.new()
	button.text = "Volver al inicio"
	button.custom_minimum_size.y = 24
	button.pressed.connect(func():
		get_tree().paused = false
		get_tree().change_scene_to_file("res://menus/start_menu.tscn")
	)
	box.add_child(button)
