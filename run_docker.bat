docker build --rm -t photoapp .
docker run -it --rm -p 7777:5000/tcp photoapp