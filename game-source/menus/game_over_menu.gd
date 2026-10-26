extends ColorRect

func _ready():
	if FileAccess.file_exists(SaveManager.save_path):
		$CenterContainer/VBoxContainer/LoadButton.grab_focus()
	else:
		$CenterContainer/VBoxContainer/QuitButton.grab_focus()


func _on_load_button_pressed():
	Sound.play(Sound.click, 1.0, -10.0)
	SaveManager.is_loading = true
	get_tree().change_scene_to_file("res://world.tscn")

func _on_quit_button_pressed():
	get_tree().change_scene_to_file("res://menus/start_menu.tscn")
