# Multitouch joystick. Keeps its finger independent from jump/attack fingers.
extends Node2D

const RADIUS = 24.0
const DEADZONE = 0.18
var finger = -1
var mouse_drag = false
var knob = Vector2.ZERO

func set_point(point):
	knob = (point - global_position).limit_length(RADIUS)
	var raw = knob.x / RADIUS
	Senai.stick_axis = signf(raw) * maxf(0, (absf(raw) - DEADZONE) / (1.0 - DEADZONE))
	queue_redraw()

func reset():
	finger = -1
	mouse_drag = false
	knob = Vector2.ZERO
	Senai.stick_axis = 0.0
	queue_redraw()

func _input(event):
	if not is_visible_in_tree() or get_tree().paused:
		return
	if event is InputEventScreenTouch:
		if event.pressed and finger == -1 and event.position.distance_to(global_position) <= RADIUS + 12:
			finger = event.index
			set_point(event.position)
			get_viewport().set_input_as_handled()
		elif not event.pressed and event.index == finger:
			reset()
			get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag and event.index == finger:
		set_point(event.position)
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and finger == -1:
		if event.pressed and event.position.distance_to(global_position) <= RADIUS + 12:
			mouse_drag = true
			set_point(event.position)
			get_viewport().set_input_as_handled()
		elif not event.pressed and mouse_drag:
			reset()
			get_viewport().set_input_as_handled()
	elif event is InputEventMouseMotion and mouse_drag:
		set_point(event.position)
		get_viewport().set_input_as_handled()

func _process(_delta):
	if (get_tree().paused or not is_visible_in_tree()) and (finger != -1 or mouse_drag):
		reset()

func _draw():
	var gold = Color("f3cf8c")
	draw_circle(Vector2.ZERO, RADIUS + 3, Color(0.06, 0.04, 0.11, 0.92))
	draw_arc(Vector2.ZERO, RADIUS + 2, 0, TAU, 48, gold, 1.0)
	draw_line(Vector2(-18, 0), Vector2(18, 0), Color("66506b"), 1.0)
	draw_colored_polygon(PackedVector2Array([Vector2(-36, 0), Vector2(-28, -6), Vector2(-28, 6)]), gold)
	draw_colored_polygon(PackedVector2Array([Vector2(36, 0), Vector2(28, -6), Vector2(28, 6)]), gold)
	draw_circle(knob, 10, Color("9f566c") if finger != -1 or mouse_drag else Color("5a3c61"))
	draw_arc(knob, 10, 0, TAU, 32, gold, 1.5)
	draw_string(ThemeDB.fallback_font, Vector2(-16, -32), "MOVER", HORIZONTAL_ALIGNMENT_LEFT, -1, 7, gold)
