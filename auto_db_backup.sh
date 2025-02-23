#!/bin/bash

# 备份源目录和目标目录
SOURCE_DIR=~/db
BACKUP_DIR=~/backup

# 确保备份目录存在
mkdir -p "$BACKUP_DIR"

# 获取当前时间戳作为备份文件名
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.tar.gz"

# 创建备份
tar -czf "$BACKUP_FILE" -C "$HOME" "db"

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "备份成功创建：$BACKUP_FILE"
else
    echo "备份失败！"
    exit 1
fi
