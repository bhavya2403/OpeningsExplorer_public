from django.http import JsonResponse
from django.shortcuts import render
from .backend_new import init_user_data, init_rating_data, move_click, go_back, change_color, get_on_display_rating, get_on_display_user, add_user
from time import time

def index(request):
    return render(request, 'on_click_ok.html')

def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'

globVars = {} # csrf: lastreq, username, clas, rangel, ranger

def usernameOk(request):
    if is_ajax(request) and request.method == 'GET':
        csrf = request.GET.get('csrfmiddlewaretoken')
        globVars[csrf]['username'] = request.GET.get('username')
        globVars[csrf]['clas'] = request.GET.get('class')
        moves = request.GET.get('moves_list')
        moves = moves[1:len(moves)-1].replace('"', '').split(',')

        res = init_user_data(globVars[csrf]['username'], globVars[csrf]['clas'], csrf)
        init_rating_data([globVars[csrf]['rangel'], globVars[csrf]['ranger']], globVars[csrf]['clas'], csrf)
        if (moves!=['']):
            for move in moves: move_click(move, csrf)

        if res: return JsonResponse({'user_data': get_on_display_user(csrf), 'rating_data': get_on_display_rating(csrf)})
        return JsonResponse({}, status=400)

def ratingOk(request):
    if is_ajax(request) and request.method == 'GET':
        csrf = request.GET.get('csrfmiddlewaretoken')
        if csrf not in globVars:
            globVars[csrf] = {'username': 'bhavya1238955', 'clas':None, 'rangel':None, 'ranger':None, 'lastreq':time()}
        globVars[csrf]['rangel'] = int(request.GET.get('rangel'))
        globVars[csrf]['ranger'] = int(request.GET.get('ranger'))
        globVars[csrf]['clas'] = request.GET.get('class')
        moves = request.GET.get('moves_list')
        moves = moves[1:len(moves)-1].replace('"', '').split(',')

        init_user_data(globVars[csrf]['username'], globVars[csrf]['clas'], csrf)
        init_rating_data([globVars[csrf]['rangel'], globVars[csrf]['ranger']], globVars[csrf]['clas'], csrf)
        if moves!=['']:
            for move in moves: move_click(move, csrf)

        return JsonResponse({'user_data': get_on_display_user(csrf), 'rating_data': get_on_display_rating(csrf)})

def moveClicked(request):
    if is_ajax(request) and request.method == 'GET':
        move_name = request.GET.get('move_name')
        csrf = request.GET.get('csrfmiddlewaretoken')
        move_click(move_name, csrf)
        return JsonResponse({'user_data': get_on_display_user(csrf), 'rating_data': get_on_display_rating(csrf)})

def goBack(request):
    if is_ajax(request) and request.method == 'GET':
        csrf = request.GET.get('csrfmiddlewaretoken')
        go_back(csrf)
        return JsonResponse({'user_data': get_on_display_user(csrf), 'rating_data': get_on_display_rating(csrf)})

def changeCol(request):
    if is_ajax(request) and request.method == 'GET':
        csrf = request.GET.get('csrfmiddlewaretoken')
        change_color(csrf)
        return JsonResponse(get_on_display_user(csrf))

def addUser(request):
    if is_ajax(request) and request.method == 'POST':
        add_user(request.POST.get('username'))
        return JsonResponse({}, status=200)