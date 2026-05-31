#!/bin/bash
set -e

echo "Cập nhật package list"
sudo apt update && sudo apt upgrade -y
echo " Cài đặt Docker"
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
if [ ! -f /usr/share/keyrings/docker-archive-keyring.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
fi
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io -y

# Thêm current user vào group docker nếu không phải root
if [ "$USER" != "root" ]; then
    sudo usermod -aG docker $USER
fi

echo "Cài đặt Nginx và Certbot"
sudo apt install nginx certbot python3-certbot-nginx -y


echo "Tạo thư mục chứa dự án"
mkdir -p /home/root/e-commerce
if [ "$USER" = "root" ]; then
    mkdir -p /root/e-commerce
fi

