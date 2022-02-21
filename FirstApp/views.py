from django.http import JsonResponse
from django.shortcuts import render
from .backend import init_user_data, init_rating_data, move_click, go_back, change_color, get_on_display_rating, get_on_display_user, add_user

def index(request):
    return render(request, 'on_click_ok.html')

def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'

username = "bhavya1238955"
clas = None
rangel, ranger = None, None
def usernameOk(request):
    global username, clas, rangel, ranger
    if is_ajax(request) and request.method == 'GET':
        username = request.GET.get('username')
        clas = request.GET.get('class')
        moves = request.GET.get('moves_list')
        moves = moves[1:len(moves)-1].replace('"', '').split(',')

        res = init_user_data(username, clas)
        init_rating_data([rangel, ranger], clas)
        if (moves!=['']):
            for move in moves: move_click(move)

        if res: return JsonResponse({'user_data': get_on_display_user(), 'rating_data': get_on_display_rating()})
        return JsonResponse({}, status=400)

def ratingOk(request):
    global username, clas, rangel, ranger
    if is_ajax(request) and request.method == 'GET':
        rangel = request.GET.get('rangel')
        ranger = request.GET.get('ranger')
        clas = request.GET.get('class')
        moves = request.GET.get('moves_list')
        moves = moves[1:len(moves)-1].replace('"', '').split(',')

        if username: init_user_data(username, clas)
        init_rating_data([int(rangel), int(ranger)], clas)
        if moves!=['']:
            for move in moves: move_click(move)

        return JsonResponse({'user_data': get_on_display_user(), 'rating_data': get_on_display_rating()})

def moveClicked(request):
    if is_ajax(request) and request.method == 'GET':
        move_name = request.GET.get('move_name')
        move_click(move_name)
        return JsonResponse({'user_data': get_on_display_user(), 'rating_data': get_on_display_rating()})

def goBack(request):
    if is_ajax(request) and request.method == 'GET':
        go_back()
        return JsonResponse({'user_data': get_on_display_user(), 'rating_data': get_on_display_rating()})

def changeCol(request):
    if is_ajax(request) and request.method == 'GET':
        change_color()
        return JsonResponse(get_on_display_user())

def addUser(request):
    if is_ajax(request) and request.method == 'POST':
        add_user(request.POST.get('username'))
        return JsonResponse({}, status=200)
