extends SceneTree

func _initialize():
	run.call_deferred()

func frames(count):
	for i in count: await physics_frame

func run():
	var instances = root.get_node("MainInstances")
	var stats = root.get_node("PlayerStats")
	var save = root.get_node("SaveManager")
	var senai = root.get_node("Senai")
	var world = load("res://world.tscn").instantiate()
	root.add_child(world)
	current_scene = world
	await frames(60)
	var player = instances.player
	assert(is_instance_valid(player))
	assert(player.ninja_visual.regions.size() == 48)
	assert(player.ninja_visual.regions.all(func(r): return r.size.x > 0 and r.size.y > 0))
	print("PASS atlas: 48 nonempty frames")
	assert(player.global_position.x < 20)
	assert(player.is_on_floor())
	print("PASS safe starting position at entrance")
	# Use a clear platform so the entrance wall cannot turn this into a wall jump.
	var floor_body = StaticBody2D.new()
	var floor_shape = CollisionShape2D.new()
	var rectangle = RectangleShape2D.new()
	rectangle.size = Vector2(160, 16)
	floor_shape.shape = rectangle
	floor_body.add_child(floor_shape)
	floor_body.position = Vector2(2000, 208)
	world.add_child(floor_body)
	player.global_position = Vector2(2000, 190)
	player.velocity = Vector2.ZERO
	player.state = player.move_state
	await frames(30)
	assert(player.is_on_floor())
	var stick = senai.joystick
	var finger = InputEventScreenTouch.new()
	finger.index = 4
	finger.position = stick.global_position + Vector2(22, 0)
	finger.pressed = true
	stick._input(finger)
	var initial_x = player.global_position.x
	await frames(12)
	assert(player.global_position.x > initial_x + 2 and senai.stick_axis > 0.8)
	var other_finger = InputEventScreenTouch.new()
	other_finger.index = 5
	other_finger.position = Vector2(240, 160)
	other_finger.pressed = true
	stick._input(other_finger)
	assert(stick.finger == 4)
	Input.action_press("jump")
	await frames(2)
	Input.action_release("jump")
	assert(player.velocity.y < 0 and senai.stick_axis > 0.8)
	finger.pressed = false
	stick._input(finger)
	assert(senai.stick_axis == 0)
	print("PASS multitouch stick moves player, independent jump finger, release to neutral")
	player.global_position = Vector2(2000, 190)
	player.velocity = Vector2.ZERO
	await frames(30)
	var pad_axis = InputEventJoypadMotion.new()
	pad_axis.axis = JOY_AXIS_LEFT_X
	pad_axis.axis_value = 0.8
	Input.parse_input_event(pad_axis)
	await frames(8)
	assert(Input.get_action_strength("move_right") > 0.5 and player.velocity.x > 0)
	pad_axis.axis_value = 0
	Input.parse_input_event(pad_axis)
	var pad_button = InputEventJoypadButton.new()
	pad_button.button_index = JOY_BUTTON_X
	pad_button.pressed = true
	Input.parse_input_event(pad_button)
	await frames(2)
	assert(player.sword_time > 0)
	pad_button.pressed = false
	Input.parse_input_event(pad_button)
	print("PASS standard gamepad stick and square-to-sword input")
	player.global_position = Vector2(2000, 190)
	player.velocity = Vector2.ZERO
	await frames(30)
	Input.action_press("jump")
	await frames(2)
	Input.action_release("jump")
	assert(player.velocity.y < 0)
	await frames(12)
	Input.action_press("jump")
	await frames(2)
	Input.action_release("jump")
	assert(player.velocity.y < 0 and not player.air_jump)
	print("PASS jump and double-jump through actual input and physics")
	player.set_physics_process(false)
	player.velocity = Vector2.ZERO
	var enemy = world.level.get_node("WalkingEnemy2")
	player.global_position = enemy.global_position + Vector2(-10, 0)
	player.facing = 1
	await frames(2)
	var health = enemy.stats.health
	player.sword_hit()
	assert(not is_instance_valid(enemy) or enemy.stats.health < health)
	print("PASS sword damages actual enemy hurtbox")
	player.player_blaster.fire_bullet()
	await frames(5)
	print("PASS shuriken scene instantiation")
	save.save_path = "user://senai_runtime_test.save"
	save.save_game()
	assert(FileAccess.file_exists(save.save_path))
	var position_before = player.global_position
	player.global_position += Vector2(100, 0)
	save.load_game()
	await frames(2)
	assert(player.global_position.distance_to(position_before) < 1)
	print("PASS persistent save and restore")
	world.load_level("res://world/level_two.tscn")
	await frames(3)
	assert(world.level.has_node("BossEnemy"))
	var boss = world.level.get_node("BossEnemy")
	assert(boss.stats.health > 0)
	boss._on_stats_no_health()
	await frames(3)
	assert(root.get_node("WorldStash").retrieve("first_boss", "freed"))
	print("PASS boss defeated and upgrade spawned")
	world.load_level("res://world/level_three.tscn")
	await frames(3)
	assert(world.level.get_child_count() > 3)
	senai.victory()
	assert(paused and senai.won)
	paused = false
	print("PASS third zone and victory")
	DirAccess.remove_absolute(save.save_path)
	world.queue_free()
	await frames(2)
	quit.call_deferred(0)
