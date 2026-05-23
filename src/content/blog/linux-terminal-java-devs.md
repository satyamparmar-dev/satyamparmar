# Linux & terminal commands for Java backend developers

*The commands you need when SSH'd into a production server with nothing but a terminal — log inspection, process management, network debugging, and file operations. All examples are Java-relevant.*

---

## Why terminal fluency matters

When something breaks in production, you often only have SSH access. No IDE, no GUI, no Kubernetes dashboard. The developer who can diagnose and fix problems at the command line is worth their weight in uptime. These commands cover the situations you actually encounter with Java/Spring Boot services.

---

## Finding and reading logs

```bash
# Follow a log file live (most used command in production)
tail -f /var/log/app/application.log

# Follow and filter (show only ERROR lines)
tail -f /var/log/app/application.log | grep ERROR

# Show last 100 lines
tail -n 100 /var/log/app/application.log

# Show first 50 lines
head -n 50 /var/log/app/application.log

# Search for a pattern in a file
grep "OutOfMemoryError" /var/log/app/application.log

# Search recursively through all log files
grep -r "NullPointerException" /var/log/app/

# Show 5 lines before and after each match (context)
grep -B 5 -A 5 "FATAL" /var/log/app/application.log

# Case-insensitive search
grep -i "connection refused" /var/log/app/application.log

# Count occurrences
grep -c "ERROR" /var/log/app/application.log

# Show line numbers
grep -n "SQLException" /var/log/app/application.log

# Multiple patterns (OR)
grep -E "ERROR|WARN|FATAL" /var/log/app/application.log

# Invert match (exclude DEBUG lines)
grep -v "DEBUG" /var/log/app/application.log

# Search for a pattern and show the file name
grep -l "OutOfMemoryError" /var/log/app/*.log
```

---

## Process management

```bash
# List all Java processes
jps -l

# Or with full command:
ps aux | grep java

# Find the PID of a Spring Boot app by port
lsof -i :8080
# Or:
ss -tlnp | grep 8080

# Kill a process gracefully (SIGTERM — Spring Boot will handle shutdown hooks)
kill <pid>

# Wait, still running? Force kill (SIGKILL — no cleanup)
kill -9 <pid>

# Kill by name (careful with wildcards)
pkill -f "myapp.jar"

# Check if a process is running
ps -p <pid>

# See what a process is doing (system calls — useful for "why is this slow?")
strace -p <pid> -s 200

# CPU and memory usage (live, refresh every 2 seconds)
top

# Better: htop (if installed)
htop

# Show CPU/memory for a specific process
top -p <pid>

# Show how much memory a Java process is using
cat /proc/<pid>/status | grep -E "VmRSS|VmSize|Threads"
```

---

## Disk and filesystem

```bash
# Check disk usage (human readable)
df -h

# Check disk usage of a specific directory
du -sh /var/log/app/

# Find the 10 largest files in a directory
du -h /var/log/ | sort -rh | head -10

# Find log files larger than 1GB
find /var/log/ -name "*.log" -size +1G

# Find files modified in the last 24 hours
find /var/log/app/ -mtime -1 -name "*.log"

# Delete files older than 30 days (careful!)
find /var/log/app/ -name "*.log" -mtime +30 -delete

# Check inode usage (when "disk full" but df -h shows space)
df -i

# See open files for a Java process (useful for "too many open files")
lsof -p <pid> | wc -l

# Find which process has a file open
lsof /var/log/app/application.log
```

---

## Network debugging

```bash
# Check if a port is listening
ss -tlnp | grep 8080
# Or:
netstat -tlnp | grep 8080

# Test if you can reach a remote host and port (like telnet but better)
nc -zv database.internal 5432
# Success: "Connection to database.internal 5432 port [tcp/postgresql] succeeded!"

# Test HTTP endpoint
curl -i http://localhost:8080/actuator/health

# Test with headers and POST body
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"customerId": 1, "items": []}' \
  -v

# Follow redirects
curl -L http://localhost:8080/api/v1/orders

# Save response to file
curl -o /tmp/response.json http://localhost:8080/api/orders

# Measure response time
curl -w "\n\nTime: %{time_total}s\nHTTP: %{http_code}\n" \
     -o /dev/null -s http://localhost:8080/api/orders

# Check DNS resolution
dig database.internal
nslookup database.internal

# Trace route to a host (find where packets are being dropped)
traceroute database.internal

# Check network connections for a process
ss -tlnp -p | grep <pid>

# Watch connection count (useful for connection pool exhaustion)
watch -n 1 'ss -s'
```

---

## Searching and text processing

```bash
# Find a file by name
find / -name "application.properties" 2>/dev/null

# Find a file containing specific text
grep -rl "spring.datasource.url" /etc/

# Extract specific fields from structured logs (awk)
# Log format: 2024-01-15 10:23:45 ERROR [OrderService] - ...
awk '{print $1, $2, $3}' application.log       # date, time, level
awk '/ERROR/ {print $4, $5, $6}' application.log  # class and message for errors

# Count errors per minute from a log file
awk '/ERROR/ {print substr($2,1,5)}' application.log | sort | uniq -c

# Extract all unique exception class names
grep -oP "(?<=Exception: )\w+" application.log | sort | uniq -c | sort -rn

# Replace text in a file (sed)
sed -i 's/localhost:5432/prod-db:5432/g' application.properties

# Print lines between two patterns
sed -n '/START_MARKER/,/END_MARKER/p' logfile.log

# Show unique lines (remove duplicates)
sort application.log | uniq

# Count occurrences of each unique line
sort application.log | uniq -c | sort -rn | head -20
```

---

## Environment and configuration

```bash
# Show all environment variables
env

# Show a specific variable
echo $JAVA_OPTS
echo $SPRING_PROFILES_ACTIVE

# Set a variable for the current session
export JAVA_OPTS="-Xmx2g -XX:+UseG1GC"

# Show Java version being used
java -version
which java

# Show where Java is installed
update-alternatives --display java  # Debian/Ubuntu
alternatives --display java         # RHEL/CentOS

# Show JVM flags of running process
jcmd <pid> VM.flags

# Show system properties of running Java process
jcmd <pid> VM.system_properties | grep spring

# List all jcmd commands available for a process
jcmd <pid> help
```

---

## Monitoring system resources

```bash
# CPU usage (top 10 CPU-consuming processes)
ps aux --sort=-%cpu | head -11

# Memory usage (top 10 memory-consuming processes)
ps aux --sort=-%mem | head -11

# Live system stats (1-second interval)
vmstat 1

# I/O stats per device
iostat -x 1

# Network traffic per interface
ifstat 1      # if installed
sar -n DEV 1  # from sysstat package

# Watch a command's output refresh every 2 seconds
watch -n 2 'ss -s'
watch -n 5 'df -h /var/log'

# See how long the system has been running and load average
uptime

# Load average explained:
# uptime output: load average: 1.20, 0.85, 0.72
# Numbers = 1-min, 5-min, 15-min averages
# Rule: > number of CPU cores = system is overloaded
nproc  # show number of CPU cores
```

---

## File transfer and remote access

```bash
# Copy a file from server to your machine
scp user@prod-server:/var/log/app/heapdump.hprof /tmp/

# Copy a directory
scp -r user@prod-server:/var/log/app/ /tmp/app-logs/

# Sync a directory (only transfers changed files)
rsync -avz user@prod-server:/var/log/app/ /tmp/app-logs/

# Run a command on a remote server without SSHing interactively
ssh user@prod-server 'jstack $(pgrep -f myapp.jar)' > /tmp/threaddump.txt

# SSH tunnel (forward remote port 5432 to local port 5433)
ssh -L 5433:prod-db:5432 user@bastion-host
# Then connect locally: jdbc:postgresql://localhost:5433/mydb
```

---

## One-liners for Java production debugging

```bash
# "Why is my app slow?" — top 5 threads by CPU
jstack <pid> | awk '/java.lang.Thread.State: RUNNABLE/{found=1} found{print; if(/^$/) found=0}' | head -50

# How many threads does the JVM have?
jcmd <pid> Thread.print | grep "java.lang.Thread.State" | sort | uniq -c

# How many HTTP connections are in TIME_WAIT? (indicator of connection pool issues)
ss -s | grep TIME-WAIT

# Check HikariCP pool stats (if Spring Boot Actuator is enabled)
curl -s http://localhost:8080/actuator/metrics/hikaricp.connections | python3 -m json.tool

# Watch log errors in real time with timestamp highlight
tail -f application.log | grep --color=always -E "ERROR|$"

# Extract all SQL queries from a Hibernate log
grep "Hibernate:" application.log | awk '{$1=$2=""; print}' | sort | uniq -c | sort -rn

# Find the thread that's causing high CPU (Linux)
top -H -p <pid>  # -H shows threads
# Note the TID of the high-CPU thread, convert to hex:
printf '%x\n' <tid>
# Search in thread dump for that hex nid:
jstack <pid> | grep "nid=0x<hex>"
```

---

## Quick command reference

| I need to... | Command |
|---|---|
| Follow logs live | `tail -f /var/log/app/app.log` |
| Search logs for pattern | `grep -n "ERROR" app.log` |
| Find Java process PID | `jps -l` |
| Kill process gracefully | `kill <pid>` |
| Take thread dump | `jstack <pid>` |
| Check port is open | `ss -tlnp \| grep 8080` |
| Test HTTP endpoint | `curl -i http://localhost:8080/health` |
| Reach remote port | `nc -zv host 5432` |
| Check disk space | `df -h` |
| Find large files | `du -sh /var/log/ \| sort -rh` |
| Copy log off server | `scp user@host:/path/file.log /tmp/` |
| Monitor CPU/memory | `top` or `htop` |
| Count errors per minute | `awk '/ERROR/ {print substr($2,1,5)}' app.log \| sort \| uniq -c` |
