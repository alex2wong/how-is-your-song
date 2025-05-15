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

# 删除超过3天的备份文件
echo "正在清理超过3天的旧备份文件..."

# 获取3天前的日期时间戳
CUTOFF_TIME=$(date -d "3 days ago" +%s)

# 遍历备份目录中的所有备份文件
for file in "$BACKUP_DIR"/db_backup_*.tar.gz; do
    # 检查文件是否存在（防止通配符不匹配的情况）
    [ -f "$file" ] || continue
    
    # 获取文件的修改时间戳
    file_time=$(stat -c %Y "$file")
    
    # 如果文件修改时间早于截止时间，则删除该文件
    if [ "$file_time" -lt "$CUTOFF_TIME" ]; then
        echo "删除旧备份: $file"
        rm "$file"
    fi
done

# 使用find命令的另一种方式（作为备用）
# find "$BACKUP_DIR" -name "db_backup_*.tar.gz" -type f -not -newermt "7 days ago" -delete

echo "清理完成"
