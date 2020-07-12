build:
	cd server && npm i && npm run build
	cd client && npm i && npm run build

clean:
	rm -rf server/dist
	rm -rf client/build

install-server-production-dependancies:
	cd server && npm i --production
