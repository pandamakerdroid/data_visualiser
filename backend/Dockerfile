FROM python:3.10

# g++ is very important
RUN apt-get update && \
    apt-get install -y g++ gdal-bin libgdal-dev python3-gdal && \
    apt-get clean

# numpy before other Python dependencies for gdal support
RUN pip install numpy

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
