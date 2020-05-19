from apscheduler.schedulers.blocking import BlockingScheduler
from main import addMovies

scheduler = BlockingScheduler()
scheduler.add_job(addMovies, "interval", seconds=30)

scheduler.start()