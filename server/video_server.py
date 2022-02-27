
from curses.ascii import SI
from pickletools import uint1
from socket import *
import subprocess
import os
import yt_dlp
import glob

serverSocket = socket(AF_INET, SOCK_DGRAM)
serverSocket.bind(('127.0.0.1', 14000))

clientSocket = socket(AF_INET, SOCK_DGRAM)
server_addr = ("127.0.0.1", 12000)


while True:
    message, address = serverSocket.recvfrom(1024)
    if (os.fork() == 0):
        try:
            sID = message.strip().decode()

            ydl_opts = {
            'format': '133',
            'outtmpl': '/home/hengj1231/video/%(id)s.mp4',
            'noplaylist': True,
            }
            ydl = yt_dlp.YoutubeDL(ydl_opts)
            dictMeta = ydl.extract_info(
                    "https://www.youtube.com/watch?v={sID}".format(sID=sID),
                    download=False)
            if (dictMeta['duration'] > 1800):
                print(sID + ",Error: Too long")
                serverSocket.sendto((sID + ",Error: Too long").encode(), address)
                exit()
            if (ydl.download(["https://www.youtube.com/watch?v={sID}".format(sID=sID)]) != 0):
                print(sID + ",Error: Cannot download")
                serverSocket.sendto((sID + ",Error: Cannot download").encode(), address)
                exit()
            os.makedirs("/home/hengj1231/video/frame/" + sID, exist_ok=True)
            time_frame = 1
            if (dictMeta['duration'] < 600 or True):
                subprocess.run(["ffmpeg", "-i", '/home/hengj1231/video/' + sID + '.mp4', "-vf", "fps=1", "/home/hengj1231/video/frame/" + sID + "/%d.jpeg"])
                time_frame = 1
            elif (dictMeta['duration'] < 1200):
                subprocess.run(["ffmpeg", "-i", '/home/hengj1231/video/' + sID + '.mp4', "-vf", "fps=0.1", "/home/hengj1231/video/frame/" + sID + "/%d.jpeg"])
                time_frame = 10
            else:
                subprocess.run(["ffmpeg", "-i", '/home/hengj1231/video/' + sID + '.mp4', "-vf", "fps=0.05", "/home/hengj1231/video/frame/" + sID + "/%d.jpeg"])
                time_frame = 20
            
            video_contents = []
            for image_file in sorted(glob.glob(os.path.join("/home/hengj1231/video/frame/" + sID, "*"))):
                id = int(os.path.basename(image_file).split('.')[0]) - 1
                clientSocket.sendto(image_file.encode(), server_addr)
                message, _ = clientSocket.recvfrom(1024)
                message = str(message)
                print(message)
                video_contents.append([id, id * time_frame, message.split(':')[1]])
            
            video_contents = sorted(video_contents,key=lambda x: x[0])
            
            if (os.access("/home/hengj1231/video/" + sID + "_contents.json", os.R_OK)):
                os.remove("/home/hengj1231/video/" + sID + "_contents.json")
            f = open("/home/hengj1231/video/" + sID + "_contents.json", "w")
            f.write('{\"j\":[')
            flag = False
            for content in video_contents:
                if (not flag):
                    flag = True
                else:
                    f.write(',')
                f.write('{\"id\":' + str(content[0]) + ',\"s\":' + str(content[1]) + ', \"c\":\"' + str(content[2]) + '\"}')
            f.write(']}')
            f.close()

            serverSocket.sendto((sID + ",Done").encode(), address)
        except Exception as error:
            serverSocket.sendto((sID+ ",Error: " + repr(error)).encode(), address)
            print(sID+ ',Error: ' + repr(error))

        exit()

