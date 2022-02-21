from django.contrib import admin
from django.urls import path
from FirstApp import views_new

urlpatterns = [
    path('', views_new.index, name='analysis'),
]