# ============================================================
# Player.gd
# Controls all player movement, state transitions, and combat.
#
# Responsibilities:
#   - Manage four movement states: AIR, FLOOR, LADDER, WALL
#   - Apply gravity, jump force, and lerp-based acceleration
#   - Handle wall-jumping with direction tracking
#   - Spawn Fireball projectiles in the player's facing direction
#   - Respond to enemy hits (ouch) and stomps (bounce)
#   - Trigger scene changes on death (fall zone or damage timer)
#
# Sections:
#   1) CLASS + CONSTANTS
#   2) PHYSICS PROCESS + STATE MACHINE
#   3) HELPER FUNCTIONS
#   4) COMBAT + DAMAGE
#   5) SIGNAL HANDLERS
# ============================================================


# ============================================================
# 1) CLASS + CONSTANTS
# ============================================================

extends KinematicBody2D

enum States {AIR = 1, FLOOR, LADDER, WALL}

var state = States.AIR
var velocity = Vector2(0, -1)
var coins = 0
var direction = 1
var last_jump_direction = 0

const SPEED       = 400
const RUNSPEED    = 800
const GRAVITY     = 30
const JUMPFORCE   = -1000
const ENEMYIMPACT = 800
const WALLJUMP    = 450
const FIREBALL    = preload("res://Fireball.tscn")


# ============================================================
# 2) PHYSICS PROCESS + STATE MACHINE
# ============================================================

func _physics_process(delta):
	match state:

		States.AIR:
			if is_on_floor():
				last_jump_direction = 0
				state = States.FLOOR
				continue
			elif is_near_wall():
				state = States.WALL
				continue

			$Sprite.play("jump")

			if Input.is_action_pressed("right"):
				# Tighter lerp factor once past target speed to avoid overshooting
				velocity.x = lerp(velocity.x, SPEED, 0.1) if velocity.x < SPEED else lerp(velocity.x, SPEED, 0.03)
				$Sprite.flip_h = false
			elif Input.is_action_pressed("left"):
				velocity.x = lerp(velocity.x, -SPEED, 0.1) if velocity.x > -SPEED else lerp(velocity.x, -SPEED, 0.03)
				$Sprite.flip_h = true
			elif not is_on_floor():
				$Sprite.play("jump")
			else:
				velocity.x = lerp(velocity.x, 0, 0.2)

			move_and_fall(false)
			fire()
			set_direction()

		States.FLOOR:
			if not is_on_floor():
				state = States.AIR

			if Input.is_action_pressed("right"):
				if Input.is_action_pressed("run"):
					velocity.x = lerp(velocity.x, RUNSPEED, 0.1)
					$Sprite.set_speed_scale(1.8)
				else:
					velocity.x = lerp(velocity.x, SPEED, 0.1)
					$Sprite.set_speed_scale(1.0)
				$Sprite.play("walk")
				$Sprite.flip_h = false
			elif Input.is_action_pressed("left"):
				if Input.is_action_pressed("run"):
					velocity.x = lerp(velocity.x, -RUNSPEED, 0.1)
					$Sprite.set_speed_scale(1.8)
				else:
					velocity.x = lerp(velocity.x, -SPEED, 0.1)
					$Sprite.set_speed_scale(1.0)
				$Sprite.flip_h = true
				$Sprite.play("walk")
			else:
				$Sprite.play("idle")
				velocity.x = lerp(velocity.x, 0, 0.2)

			if Input.is_action_just_pressed("jump"):
				velocity.y = JUMPFORCE
				$SoundJump.play()
				state = States.AIR

			move_and_fall(false)
			fire()
			set_direction()

		States.WALL:
			if is_on_floor():
				last_jump_direction = 0
				state = States.FLOOR
				continue
			elif not is_near_wall():
				state = States.AIR
				continue

			$Sprite.play("happy")

			# Wall-jump: only allowed when jumping toward the wall from the opposite side
			if (direction != last_jump_direction
					and Input.is_action_pressed("jump")
					and (Input.is_action_pressed("left") and direction == 1)
					or (Input.is_action_pressed("right") and direction == -1)):
				last_jump_direction = direction
				velocity.x = WALLJUMP * -direction
				velocity.y = JUMPFORCE * 0.85
				$SoundJump.play()
				state = States.AIR

			move_and_fall(true)
			set_direction()

	# Passive deceleration applied every frame regardless of state
	velocity.x = lerp(velocity.x, 0, 0.1)


# ============================================================
# 3) HELPER FUNCTIONS
# ============================================================

func is_near_wall():
	return $Wallchecker.is_colliding()


func set_direction():
	direction = 1 if not $Sprite.flip_h else -1
	# Rotate the wall-checker ray to always point away from the player's facing side
	$Wallchecker.rotation_degrees = 90 * -direction


func move_and_fall(slow_fall: bool):
	velocity.y = GRAVITY + velocity.y

	if slow_fall:
		# Wall-slide: cap fall speed so the player drifts down slowly
		velocity.y = clamp(velocity.y, JUMPFORCE, 200)

	velocity = move_and_slide(velocity, Vector2.UP)


func fire():
	if Input.is_action_just_pressed("fireball") and not is_near_wall():
		var dir = 1 if not $Sprite.flip_h else -1
		var f = FIREBALL.instance()
		f.direction = dir
		get_parent().add_child(f)
		f.position.y = position.y
		f.position.x = position.x + 30 * dir


# ============================================================
# 4) COMBAT + DAMAGE
# ============================================================

func bounce():
	# Called by enemy when player stomps it from above
	velocity.y = JUMPFORCE * 0.65


func ouch(var posX):
	# Flash the player red-transparent, knock them back, then start death timer
	set_modulate(Color(1, 0.3, 0.3, 0.3))
	velocity.y = JUMPFORCE * 0.5
	if position.x < posX:
		velocity.x = -ENEMYIMPACT
	elif position.x > posX:
		velocity.x = ENEMYIMPACT
	Input.action_release("left")
	Input.action_release("right")
	$Timer.start()
	$SoundKilled.play()


# ============================================================
# 5) SIGNAL HANDLERS
# ============================================================

func _on_Fall_Zone_body_entered(body):
	get_tree().change_scene("res://GameOver.tscn")


func _on_Timer_timeout():
	get_tree().change_scene("res://GameOver.tscn")
