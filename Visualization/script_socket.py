from socket import *
import json
import string
import time

def forward(data, port, targetHost, listenPort):
	print("Forwarding: '%s' from port %s" % (data, port))
	sock = socket(AF_INET, SOCK_DGRAM)
	sock.bind(("localhost", port)) # Bind to the port data came in on
	sock.sendto(str.encode(json.dumps(data)), (targetHost, listenPort))

def main():
	bufsize = 1024 # Modify to suit your needs
	targetHost = "127.0.0.1"
	#listenPort = 8788
	with open("data/data.json", "r") as json_file:
		data = json.load(json_file)
	for i in data:
		# same port or not?
		forward(i, 8887, targetHost, 8889)
		time.sleep(1)

if __name__ == "__main__":
	main()