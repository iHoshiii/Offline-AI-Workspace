import os
import platform
import psutil
from datetime import datetime

class ToolService:
    def get_system_info(self) -> str:
        cpu_usage = psutil.cpu_percent()
        ram = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        info = [
            f"OS: {platform.system()} {platform.release()}",
            f"CPU Usage: {cpu_usage}%",
            f"RAM: {ram.percent}% used ({round(ram.used / (1024**3), 2)}GB / {round(ram.total / (1024**3), 2)}GB)",
            f"Disk: {disk.percent}% used ({round(disk.free / (1024**3), 2)}GB free)",
            f"Current Date/Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        ]
        return "\n".join(info)

tool_service = ToolService()
