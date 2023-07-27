extends Node2D

var player_id : String
@export var move_speed = 15

func _ready():
    send_request(Request.new("http://localhost:8000/init?x={x}&y={y}".format({ "x": self.position.x, "y": self.position.y })), self._init_player_handler)

func _process(delta):
    var direction = Vector2.ZERO
    if Input.is_action_pressed("ui_right"):
        direction.x += 1
    if Input.is_action_pressed("ui_left"):
        direction.x -= 1
    if Input.is_action_pressed("ui_up"):
        direction.y -= 1
    if Input.is_action_pressed("ui_down"):
        direction.y += 1
        
    direction = direction.normalized() * move_speed
    print(direction)
    if direction != Vector2.ZERO:
        send_request(Request.new("http://localhost:8000/move?player_id={player_id}&x={x}&y={y}".format({ "player_id":self.player_id, "x": direction.x, "y": direction.y })), self._move_player_handler)

func send_request(request: Request, callback: Callable):
    var http_request = HTTPRequest.new()
    add_child(http_request)
    http_request.request_completed.connect(callback)
    var error = http_request.request(request.url, request.headers, request.method, request.body)
    if error != OK:
        print("error:", error)
    

func _init_player_handler(result, response_code, headers, body):
    var json = JSON.new()
    json.parse(body.get_string_from_utf8())
    var response = json.get_data()
    player_id = response.player_id
    print("Got player id:", player_id)
    
func _move_player_handler(result, response_code, headers, body):
    if result == 0:
        var json = JSON.new()
        json.parse(body.get_string_from_utf8())
        var response = json.get_data()
        position = Vector2(response.position.x, response.position.y)
        print("Moved player to:", position)
    else:
        print("Invalid move.")

class Request:
    var url
    var method
    var headers
    var body
    func _init(u, m: HTTPClient.Method = 0, h = PackedStringArray([]), b = ""):
        url = u
        method = m
        headers = h
        body = b
