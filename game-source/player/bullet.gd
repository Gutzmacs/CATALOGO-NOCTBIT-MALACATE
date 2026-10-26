extends Projectile

func _ready():
	super()
	$Sprite2D.modulate.a = 0.0
	set_process(false)

func _draw():
	var angle = Time.get_ticks_msec() / 70.0
	for i in 4:
		var point = Vector2.RIGHT.rotated(angle + i * PI / 2)
		draw_line(-point, point * 3, Color("e8d7b5"), 1.0)

func _process(delta):
	super(delta)
	queue_redraw()

