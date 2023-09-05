all: run

build:
	docker compose up --build;\

down:
	docker compose down -v;\

run: down
	rm -rf nestjs/prisma/migrations;\
	docker compose up;\

back:
	docker exec -it nestjs-container sh;\

front:
	docker exec -it react-container sh;\

logs-back:
	docker logs nestjs-container;\

logs-front:
	docker logs react-container;\

restart:
	docker compose restart

restart-back:
	docker restart nestjs-container;\

restart-front:
	docker restart react-container;\

clean:
	docker system prune --force;\

fclean: clean
	@docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\
	docker network rm $$(docker network ls -q);\