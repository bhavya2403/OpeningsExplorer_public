from django.db import models

# Create your models here.

class ChesscomGames(models.Model):
    user = models.CharField(max_length=30, blank=True, null=True)
    user_white = models.IntegerField(blank=True, null=True)
    date_time = models.DateTimeField(blank=True, null=True)
    time_control = models.CharField(max_length=10, blank=True, null=True)
    moves = models.CharField(max_length=2000, blank=True, null=True)
    white_won = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chesscom_games'

class UserRatings(models.Model):
    user = models.CharField(max_length=30, blank=True, null=True)
    rapid = models.IntegerField(blank=True, null=True)
    blitz = models.IntegerField(blank=True, null=True)
    bullet = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user_ratings'