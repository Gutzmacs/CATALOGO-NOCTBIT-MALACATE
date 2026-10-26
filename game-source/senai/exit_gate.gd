extends Node2D

func _process(_delta):
	var player = MainInstances.player
	if player is Player and player.global_position.distance_to(global_position) < 18:
		if WorldStash.retrieve("first_boss", "freed"):
			Senai.victory()
	queue_redraw()

func _draw():
	draw_rect(Rect2(-12, -27, 24, 32), Color("e9c17c"), false, 2.0)
	draw_circle(Vector2(0, -10), 5 + sin(Time.get_ticks_msec() / 300.0), Color("ba5668"))
