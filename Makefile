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

clean:
	docker system prune --force;\

fclean: clean
	@docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\
	docker network rm $$(docker network ls -q);\