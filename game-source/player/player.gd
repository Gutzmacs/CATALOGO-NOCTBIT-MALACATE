class_name Player
extends CharacterBody2D

const DustEffectScene = preload("res://effects/dust_effect.tscn")
const JumpEffectScene = preload("res://effects/jump_effect.tscn")
const WallJumpEffectScene = preload("res://effects/wall_jump_effect.tscn")

@export var acceleration = 512
@export var max_velocity = 64
@export var friction = 256
@export var air_friction = 64
@export var gravity = 200
@export var jump_force = 128
@export var max_fall_velocity = 128
@export var wall_slide_speed = 42
@export var max_wall_slide_speed = 128

var air_jump = false
var state = move_state
var facing = 1.0
var sword_time = 0.0
var sword_cooldown = 0.0
var throw_time = 0.0
var ninja_visual: Node2D

@onready var animation_player = $AnimationPlayer
@onready var sprite_2d = $Sprite2D
@onready var coyote_jump_timer = $CoyoteJumpTimer
@onready var player_blaster = $PlayerBlaster
@onready var fire_rate_timer = $FireRateTimer
@onready var drop_timer = $DropTimer
@onready var camera_2d = $Camera2D
@onready var hurtbox : = $Hurtbox
@onready var blinking_animation_player = $BlinkingAnimationPlayer
@onready var center = $Center

func _ready():
	PlayerStats.no_health.connect(die)
	sprite_2d.modulate.a = 0.0
	player_blaster.modulate.a = 0.0
	ninja_visual = Node2D.new()
	ninja_visual.set_script(preload("res://senai/ninja_visual.gd"))
	add_child(ninja_visual)

func _enter_tree():
	MainInstances.player = self

func _physics_process(delta):
	sword_time = maxf(0.0, sword_time - delta)
	sword_cooldown = maxf(0.0, sword_cooldown - delta)
	throw_time = maxf(0.0, throw_time - delta)
	var axis = Senai.movement_axis()
	if axis != 0:
		facing = sign(axis)
	if Input.is_action_just_pressed("sword") and sword_cooldown <= 0:
		sword_time = 0.36
		sword_cooldown = 0.4
	if sword_time > 0.08 and sword_time < 0.24:
		sword_hit()
	state.call(delta)
		
	if Input.is_action_pressed("fire") and fire_rate_timer.time_left == 0:
		fire_rate_timer.start()
		player_blaster.fire_bullet()
		throw_time = 0.32
	
	if (Input.is_action_pressed("fire_missile")
	and fire_rate_timer.time_left == 0
	and PlayerStats.missiles > 0):
		fire_rate_timer.start()
		player_blaster.fire_missile()
		PlayerStats.missiles -= 1
		throw_time = 0.32
	if global_position.y > 600:
		die()

func sword_hit():
	var shape = RectangleShape2D.new()
	shape.size = Vector2(24, 22)
	var query = PhysicsShapeQueryParameters2D.new()
	query.shape = shape
	query.transform = Transform2D(0, global_position + Vector2(facing * 14, -9))
	query.collision_mask = 32
	query.collide_with_areas = true
	query.collide_with_bodies = false
	for result in get_world_2d().direct_space_state.intersect_shape(query):
		var target = result.collider
		if target is Hurtbox and not target.has_meta("senai_sword"):
			target.set_meta("senai_sword", true)
			target.take_hit(null, 1)
			Senai.release_sword_target(target)

func _exit_tree():
	MainInstances.player = null

func move_state(delta):
	apply_gravity(delta)
	var input_axis = Senai.movement_axis()
	if is_moving(input_axis):
		apply_acceleration(delta, input_axis)
	else:
		apply_friction(delta)
	jump_check()
	if Input.is_action_just_pressed("crouch"):
		set_collision_mask_value(2, false)
		drop_timer.start()
	update_animations(input_axis)
	var was_on_floor = is_on_floor()
	move_and_slide()
	var just_left_edge = was_on_floor and not is_on_floor() and velocity.y >= 0
	if just_left_edge:
		coyote_jump_timer.start()
	wall_check()

func wall_slide_state(delta):
	var wall_normal = get_wall_normal()
	animation_player.play("wall_slide")
	sprite_2d.scale.x = sign(wall_normal.x)
	velocity.y = clampf(velocity.y, -max_wall_slide_speed/2, max_wall_slide_speed)
	wall_jump_check(wall_normal.x)
	apply_wall_slide_gravity(delta)
	move_and_slide()
	wall_detatch(delta, wall_normal.x)

func wall_check():
	if not is_on_floor() and is_on_wall():
		state = wall_slide_state
		air_jump = true
		create_dust_effect()

func wall_detatch(delta, wall_axis):
	if Senai.movement_axis() > 0.25 and wall_axis == 1:
		velocity.x = acceleration * delta
		state = move_state
	if Senai.movement_axis() < -0.25 and wall_axis == -1:
		velocity.x = -acceleration * delta
		state = move_state
	if not is_on_wall() or is_on_floor():
		state = move_state

func wall_jump_check(wall_axis):
	if Input.is_action_just_pressed("jump"):
		Sound.play(Sound.jump, randf_range(0.8, 1.1), 5.0)
		velocity.x = wall_axis * max_velocity
		state = move_state
		jump(jump_force * 0.75, false)
		var wall_jump_effect_position = global_position + Vector2(wall_axis * 3.5, -2)
		var wall_jump_effect = Utils.instantiate_scene_on_level(WallJumpEffectScene, wall_jump_effect_position)
		wall_jump_effect.scale.x = wall_axis

func apply_wall_slide_gravity(delta):
	var slide_speed = wall_slide_speed
	if Input.is_action_pressed("crouch"):
		slide_speed = max_wall_slide_speed
	velocity.y = move_toward(velocity.y, slide_speed, gravity * delta)

func create_dust_effect():
	Sound.play(Sound.step, randf_range(0.8, 1.1), -5.0)
	Utils.instantiate_scene_on_level(DustEffectScene, global_position)

func is_moving(input_axis):
	return input_axis != 0

func apply_gravity(delta):
	if not is_on_floor():
		velocity.y = move_toward(velocity.y, max_fall_velocity, gravity * delta)

func apply_acceleration(delta, input_axis):
	if is_moving(input_axis):
		velocity.x = move_toward(velocity.x, input_axis * max_velocity, acceleration * delta)

func apply_friction(delta):
	if is_on_floor():
		velocity.x = move_toward(velocity.x, 0, friction * delta)
	else:
		velocity.x = move_toward(velocity.x, 0, air_friction * delta)

func jump_check():
	if is_on_floor():
		air_jump = true
	
	if is_on_floor() or coyote_jump_timer.time_left > 0.0:
		if Input.is_action_just_pressed("jump"):
			jump(jump_force)
	if not is_on_floor():
		if Input.is_action_just_released("jump") and velocity.y < -jump_force / 2:
			velocity.y = -jump_force / 2
		
		if Input.is_action_just_pressed("jump") and air_jump:
			jump(jump_force * 0.75)
			air_jump = false

func jump(force, create_effect = true):
	Sound.play(Sound.jump, randf_range(0.8, 1.1), 5.0)
	velocity.y = -force
	if create_effect:
		Utils.instantiate_scene_on_level(JumpEffectScene, global_position)

func update_animations(input_axis):
	sprite_2d.scale.x = sign(get_local_mouse_position().x)
	if abs(sprite_2d.scale.x) != 1: sprite_2d.scale.x = 1
	if is_moving(input_axis):
		animation_player.play("run")
		animation_player.speed_scale = input_axis * sprite_2d.scale.x
	else:
		animation_player.play("idle")
	
	if not is_on_floor():
		animation_player.play("jump")

func die():
	camera_2d.reparent(get_tree().current_scene)
	queue_free()
	Events.player_died.emit()

func _on_drop_timer_timeout():
	set_collision_mask_value(2, true)

func _on_hurtbox_hurt(hitbox, damage):
	Sound.play(Sound.hurt)
	Events.add_screenshake.emit(3, 0.25)
	PlayerStats.health -= 1
	hurtbox.is_invincible = true
	blinking_animation_player.play("blink")
	await blinking_animation_player.animation_finished
	hurtbox.is_invincible = false
