FROM python:3.12.2-slim

WORKDIR /flask-deployment
COPY .env app.py blob_storage_helper.py common_helper.py mongo_helper.py requirements.txt  /flask-deployment/

RUN pip3 install --upgrade pip && pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["gunicorn", "app:app", "-b", "0.0.0.0:5000", "-w", "4"]