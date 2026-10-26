class_name Level
extends Node2D

func _enter_tree():
	MainInstances.level = self

func _ready():
	if scene_file_path.ends_with("level_three.tscn"):
		var gate = Node2D.new()
		gate.set_script(preload("res://senai/exit_gate.gd"))
		gate.position = Vector2(304, 70)
		add_child(gate)
