# SENAI addition: animate the supplied atlas while preserving original physics.
extends Node2D

const ATLAS = preload("res://senai/ninja-atlas.png")
const CELL = Vector2(181, 181)
var age = 0.0
var regions: Array[Rect2] = []
var offsets: Array[Vector2] = []

func _ready():
	var image = ATLAS.get_image()
	for row in 6:
		for column in 8:
			var cell = Rect2i(column * 181, row * 181, 181, 181)
			var used = image.get_region(cell).get_used_rect()
			regions.append(Rect2(Vector2(cell.position + used.position), Vector2(used.size)))
			offsets.append(Vector2(-used.size.x / 2.0, -used.size.y))

func _process(delta):
	age += delta
	queue_redraw()

func _draw():
	var player = get_parent() as Player
	if player == null or regions.size() != 48:
		return
	if player.hurtbox.is_invincible and int(age * 12) % 2 == 0:
		return
	var row = 0
	var column = int(age * 9) % 8
	if abs(player.velocity.x) > 5:
		row = 1
		column = int(age * 12) % 8
	if not player.is_on_floor():
		row = 2
		column = 2 if player.velocity.y < 0 else 5
	if player.throw_time > 0:
		row = 4
		column = clampi(int((0.32 - player.throw_time) * 25), 0, 7)
	if player.sword_time > 0:
		row = 3
		column = clampi(int((0.36 - player.sword_time) * 22), 0, 7)
	var index = row * 8 + column
	draw_set_transform(Vector2.ZERO, 0, Vector2(player.facing * 0.14, 0.14))
	draw_texture_rect_region(ATLAS, Rect2(offsets[index], regions[index].size), regions[index])
