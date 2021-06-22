# syntax=docker/dockerfile:1

FROM python:3

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
RUN pip3 install signalwire

ENV FLASK_APP="main.py"

WORKDIR /app

EXPOSE 5000

COPY . .

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
