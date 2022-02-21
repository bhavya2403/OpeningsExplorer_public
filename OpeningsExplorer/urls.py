"""OpeningsExplorer URL Configuration
The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from FirstApp import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('explorer/', include('FirstApp.urls')),
    path('', include('HomePage.urls')),
    path('get/ajax/user_ok', views.usernameOk, name='user_ok'),
    path('get/ajax/rating_ok', views.ratingOk, name='rating_ok'),
    path('get/ajax/move_click', views.moveClicked, name='move_click'),
    path('get/ajax/go_back', views.goBack, name='go_back'),
    path('get/ajax/change_color', views.changeCol, name='change_color'),
    path('post/ajax/add_user', views.addUser, name='add_user'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_URL)