#!/usr/bin/env python3
"""
System Administrator Email Alert System
Monitors system resources and sends email alerts when thresholds are exceeded
"""

import smtplib
import psutil
import time
import json
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import List, Dict, Any
import threading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('system_alerts.log'),
        logging.StreamHandler()
    ]
)

class EmailAlertSystem:
    def __init__(self, config_file: str = 'alert_config.json'):
        """Initialize the email alert system with configuration"""
        self.config = self.load_config(config_file)
        self.alert_history = {}
        self.running = False
        
    def load_config(self, config_file: str) -> Dict[str, Any]:
        """Load configuration from JSON file"""
        default_config = {
            "smtp": {
                "server": "smtp.gmail.com",
                "port": 587,
                "username": "your-email@gmail.com",
                "password": "your-app-password",  # Use app password for Gmail
                "use_tls": True
            },
            "alerts": {
                "from_email": "alerts@yourcompany.com",
                "to_emails": ["admin1@yourcompany.com", "admin2@yourcompany.com"],
                "subject_prefix": "[SYSTEM ALERT]"
            },
            "thresholds": {
                "cpu_percent": 80,
                "memory_percent": 85,
                "disk_percent": 90,
                "load_average": 4.0
            },
            "monitoring": {
                "check_interval": 60,  # seconds
                "cooldown_period": 300  # seconds between duplicate alerts
            }
        }
        
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
                # Merge with defaults
                for key in default_config:
                    if key not in config:
                        config[key] = default_config[key]
                return config
        except FileNotFoundError:
            logging.warning(f"Config file {config_file} not found, using defaults")
            # Create default config file
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
            return default_config
    
    def send_email(self, subject: str, body: str, priority: str = "normal") -> bool:
        """Send email alert to administrators"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.config['alerts']['from_email']
            msg['To'] = ', '.join(self.config['alerts']['to_emails'])
            msg['Subject'] = f"{self.config['alerts']['subject_prefix']} {subject}"
            
            # Add priority header
            if priority == "high":
                msg['X-Priority'] = '1'
                msg['X-MSMail-Priority'] = 'High'
            
            # Create HTML body
            html_body = f"""
            <html>
            <head></head>
            <body>
                <h2 style="color: {'#d32f2f' if priority == 'high' else '#1976d2'};">System Alert</h2>
                <p><strong>Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p><strong>Priority:</strong> {priority.upper()}</p>
                <hr>
                <div style="font-family: monospace; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                    {body.replace('\n', '<br>')}
                </div>
                <hr>
                <p><em>This is an automated message from the System Monitoring Service</em></p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(html_body, 'html'))
            
            # Connect to SMTP server
            server = smtplib.SMTP(self.config['smtp']['server'], self.config['smtp']['port'])
            if self.config['smtp']['use_tls']:
                server.starttls()
            
            server.login(self.config['smtp']['username'], self.config['smtp']['password'])
            
            # Send email
            text = msg.as_string()
            server.sendmail(
                self.config['alerts']['from_email'],
                self.config['alerts']['to_emails'],
                text
            )
            server.quit()
            
            logging.info(f"Alert email sent: {subject}")
            return True
            
        except Exception as e:
            logging.error(f"Failed to send email: {str(e)}")
            return False
    
    def check_cpu_usage(self) -> Dict[str, Any]:
        """Check CPU usage"""
        cpu_percent = psutil.cpu_percent(interval=1)
        load_avg = psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else 0
        
        alerts = []
        if cpu_percent > self.config['thresholds']['cpu_percent']:
            alerts.append({
                'type': 'cpu_high',
                'message': f"High CPU usage detected: {cpu_percent:.1f}%",
                'value': cpu_percent,
                'threshold': self.config['thresholds']['cpu_percent'],
                'priority': 'high' if cpu_percent > 95 else 'medium'
            })
        
        if load_avg > self.config['thresholds']['load_average']:
            alerts.append({
                'type': 'load_high',
                'message': f"High load average detected: {load_avg:.2f}",
                'value': load_avg,
                'threshold': self.config['thresholds']['load_average'],
                'priority': 'high' if load_avg > 8 else 'medium'
            })
        
        return {'cpu_percent': cpu_percent, 'load_avg': load_avg, 'alerts': alerts}
    
    def check_memory_usage(self) -> Dict[str, Any]:
        """Check memory usage"""
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        alerts = []
        if memory.percent > self.config['thresholds']['memory_percent']:
            alerts.append({
                'type': 'memory_high',
                'message': f"High memory usage detected: {memory.percent:.1f}% ({memory.used // (1024**3):.1f}GB used)",
                'value': memory.percent,
                'threshold': self.config['thresholds']['memory_percent'],
                'priority': 'high' if memory.percent > 95 else 'medium'
            })
        
        if swap.percent > 50:  # Swap usage is generally bad
            alerts.append({
                'type': 'swap_high',
                'message': f"High swap usage detected: {swap.percent:.1f}%",
                'value': swap.percent,
                'threshold': 50,
                'priority': 'high'
            })
        
        return {
            'memory_percent': memory.percent,
            'swap_percent': swap.percent,
            'alerts': alerts
        }
    
    def check_disk_usage(self) -> Dict[str, Any]:
        """Check disk usage for all mounted drives"""
        alerts = []
        disk_info = {}
        
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                percent_used = (usage.used / usage.total) * 100
                disk_info[partition.mountpoint] = percent_used
                
                if percent_used > self.config['thresholds']['disk_percent']:
                    alerts.append({
                        'type': 'disk_high',
                        'message': f"High disk usage on {partition.mountpoint}: {percent_used:.1f}% ({usage.free // (1024**3):.1f}GB free)",
                        'value': percent_used,
                        'threshold': self.config['thresholds']['disk_percent'],
                        'priority': 'high' if percent_used > 95 else 'medium'
                    })
            except PermissionError:
                continue
        
        return {'disk_usage': disk_info, 'alerts': alerts}
    
    def check_system_processes(self) -> Dict[str, Any]:
        """Check for suspicious processes or high resource usage"""
        alerts = []
        top_processes = []
        
        # Get top CPU consuming processes
        processes = [(p.info['pid'], p.info['name'], p.info['cpu_percent']) 
                    for p in psutil.process_iter(['pid', 'name', 'cpu_percent'])]
        processes.sort(key=lambda x: x[2], reverse=True)
        
        for pid, name, cpu in processes[:5]:
            top_processes.append(f"{name} (PID: {pid}): {cpu:.1f}% CPU")
            if cpu > 50:  # Process using more than 50% CPU
                alerts.append({
                    'type': 'process_high_cpu',
                    'message': f"Process {name} (PID: {pid}) using {cpu:.1f}% CPU",
                    'value': cpu,
                    'threshold': 50,
                    'priority': 'medium'
                })
        
        return {'top_processes': top_processes, 'alerts': alerts}
    
    def should_send_alert(self, alert_type: str) -> bool:
        """Check if enough time has passed since last alert of this type"""
        now = time.time()
        last_sent = self.alert_history.get(alert_type, 0)
        cooldown = self.config['monitoring']['cooldown_period']
        
        if now - last_sent > cooldown:
            self.alert_history[alert_type] = now
            return True
        return False
    
    def run_system_check(self):
        """Run a complete system check and send alerts if necessary"""
        logging.info("Running system check...")
        
        # Collect all system metrics
        cpu_data = self.check_cpu_usage()
        memory_data = self.check_memory_usage()
        disk_data = self.check_disk_usage()
        process_data = self.check_system_processes()
        
        # Collect all alerts
        all_alerts = []
        all_alerts.extend(cpu_data['alerts'])
        all_alerts.extend(memory_data['alerts'])
        all_alerts.extend(disk_data['alerts'])
        all_alerts.extend(process_data['alerts'])
        
        # Send alerts if any found
        if all_alerts:
            for alert in all_alerts:
                if self.should_send_alert(alert['type']):
                    # Create detailed report
                    report = f"""
SYSTEM ALERT DETAILS:
{alert['message']}

CURRENT SYSTEM STATUS:
- CPU Usage: {cpu_data['cpu_percent']:.1f}%
- Load Average: {cpu_data.get('load_avg', 'N/A')}
- Memory Usage: {memory_data['memory_percent']:.1f}%
- Swap Usage: {memory_data['swap_percent']:.1f}%

DISK USAGE:
"""
                    for mount, usage in disk_data['disk_usage'].items():
                        report += f"- {mount}: {usage:.1f}%\n"
                    
                    report += f"""
TOP PROCESSES:
"""
                    for process in process_data['top_processes']:
                        report += f"- {process}\n"
                    
                    # Send email
                    subject = f"{alert['type'].replace('_', ' ').title()} - {alert['message']}"
                    self.send_email(subject, report, alert['priority'])
        else:
            logging.info("System check completed - no alerts triggered")
    
    def start_monitoring(self):
        """Start continuous monitoring"""
        self.running = True
        logging.info("Starting system monitoring...")
        
        while self.running:
            try:
                self.run_system_check()
                time.sleep(self.config['monitoring']['check_interval'])
            except KeyboardInterrupt:
                logging.info("Monitoring stopped by user")
                break
            except Exception as e:
                logging.error(f"Error during monitoring: {str(e)}")
                time.sleep(30)  # Wait before retrying
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.running = False
        logging.info("Monitoring stopped")
    
    def send_test_alert(self):
        """Send a test alert to verify email configuration"""
        test_body = f"""
This is a test alert from the System Monitoring Service.

Current System Status:
- CPU Usage: {psutil.cpu_percent(interval=1):.1f}%
- Memory Usage: {psutil.virtual_memory().percent:.1f}%
- Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

If you received this email, the alert system is working correctly.
        """
        
        return self.send_email("Test Alert", test_body, "normal")

def main():
    """Main function to run the alert system"""
    import argparse
    
    parser = argparse.ArgumentParser(description='System Administrator Email Alert System')
    parser.add_argument('--config', default='alert_config.json', help='Configuration file path')
    parser.add_argument('--test', action='store_true', help='Send test email')
    parser.add_argument('--check', action='store_true', help='Run single system check')
    parser.add_argument('--monitor', action='store_true', help='Start continuous monitoring')
    
    args = parser.parse_args()
    
    # Initialize alert system
    alert_system = EmailAlertSystem(args.config)
    
    if args.test:
        print("Sending test email...")
        if alert_system.send_test_alert():
            print("Test email sent successfully!")
        else:
            print("Failed to send test email. Check configuration and logs.")
    
    elif args.check:
        print("Running single system check...")
        alert_system.run_system_check()
        print("System check completed.")
    
    elif args.monitor:
        print("Starting continuous monitoring...")
        print("Press Ctrl+C to stop")
        try:
            alert_system.start_monitoring()
        except KeyboardInterrupt:
            alert_system.stop_monitoring()
    
    else:
        parser.print_help()

if __name__ == '__main__':
    main()