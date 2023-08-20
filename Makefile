run:
	docker compose down -v;\
	rm -rf nestjs/prisma/migrations;\
	docker compose up --build;\

clean:
	docker system prune --force;\

fclean: clean
	@docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\
	docker network rm $$(docker network ls -q);\