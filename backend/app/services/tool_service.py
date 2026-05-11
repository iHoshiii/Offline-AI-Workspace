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
            f"Current Date/Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Current Directory: {os.getcwd()}"
        ]
        return "\n".join(info)

    def list_files(self, path: str = ".") -> str:
        try:
            files = os.listdir(path)
            return f"Files in {os.path.abspath(path)}:\n" + "\n".join(files[:20]) # Limit to 20
        except Exception as e:
            return f"Error listing files: {str(e)}"

    def search_files(self, query: str, path: str = ".") -> str:
        matches = []
        try:
            for root, dirs, files in os.walk(path):
                for file in files:
                    if query.lower() in file.lower():
                        matches.append(os.path.join(root, file))
                        if len(matches) >= 10: break
                if len(matches) >= 10: break
            return f"Search results for '{query}':\n" + "\n".join(matches)
        except Exception as e:
            return f"Error searching files: {str(e)}"

tool_service = ToolService()
