# MySQL LAN Setup on macOS (Oracle MySQL Package)

This runbook documents how to allow MySQL access from local network clients such as `192.168.1.x`.

## 1. Fix SQL Host Pattern (`%` not `*`)

Use `%` wildcard in MySQL host definitions.

```sql
CREATE USER 'appuser'@'192.168.1.%' IDENTIFIED BY 'StrongPassword!';
GRANT ALL PRIVILEGES ON your_db.* TO 'appuser'@'192.168.1.%';
FLUSH PRIVILEGES;
```

If the user already exists:

```sql
ALTER USER 'appuser'@'192.168.1.%' IDENTIFIED BY 'StrongPassword!';
```

## 2. Confirm MySQL Config Search Paths

```bash
/usr/local/mysql/bin/mysqld --verbose --help | grep -A 1 "Default options"
```

Expected output includes files like:

- `/etc/my.cnf`
- `/etc/mysql/my.cnf`
- `/usr/local/mysql/etc/my.cnf`
- `~/.my.cnf`

Use the first file available (`/etc/my.cnf` is preferred if present).

## 3. Enable Network Listening

Edit config:

```bash
sudo vi /etc/my.cnf
```

Set:

```ini
[mysqld]
bind-address = 0.0.0.0
```

Make sure `skip-networking` is not enabled. If present, comment/remove it:

```ini
# skip-networking
```

## 4. Restart MySQL (Oracle package)

```bash
sudo /usr/local/mysql/support-files/mysql.server restart
```

Note: `PID file could not be found` during restart can happen if MySQL was not running before. It may still start successfully after that.

## 5. If You See "Multiple MySQL running..."

This means multiple `mysqld` processes were started by different control paths.

Inspect running PIDs:

```bash
ps -fp <pid1>,<pid2>,<pid3>
```

Stop via script:

```bash
sudo /usr/local/mysql/support-files/mysql.server stop
```

Check launchd entries:

```bash
sudo launchctl list | grep -i mysql
```

If Oracle daemon is loaded, unload it:

```bash
sudo launchctl bootout system /Library/LaunchDaemons/com.oracle.oss.mysql.mysqld.plist
```

Kill leftovers:

```bash
sudo pkill -f mysqld
sleep 2
pgrep -lf mysqld
```

Start only one way (recommended for Oracle package):

```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

## 6. Verify Service and Listener

Check status:

```bash
sudo /usr/local/mysql/support-files/mysql.server status
```

Check listener (`sudo` is important):

```bash
sudo lsof -nP -iTCP:3306 -sTCP:LISTEN
```

If empty, also check all MySQL listeners:

```bash
sudo lsof -nP -iTCP -sTCP:LISTEN | grep mysqld
```

## 7. Verify Runtime Network Variables

```bash
/usr/local/mysql/bin/mysql -uroot -p -e "SHOW VARIABLES WHERE Variable_name IN ('port','bind_address','skip_networking','mysqlx_port');"
```

Expected:

- `port = 3306`
- `bind_address = 0.0.0.0` (or server LAN IP)
- `skip_networking = OFF`

## 8. Client Test from Another LAN Machine

```bash
mysql -h <mysql_server_lan_ip> -u appuser -p
```

Example server IP may look like `192.168.1.10`.

## 9. Common Error Notes

- `Error Code: 1064 ... near 'appuser'`: SQL syntax issue, often caused by invalid host pattern or missing quotes.
- `Formula 'mysql' is not installed`: only relevant to Homebrew installs; Oracle package installs use `/usr/local/mysql/...` commands.
- `zsh: no matches found: /usr/local/mysql/data/*.err`: glob matched nothing (log path differs or no file there).

## 10. Security Recommendations

- Prefer `'appuser'@'192.168.1.%'` over `'appuser'@'%'`.
- Use a strong password and only grant required database privileges.
- Do not expose MySQL directly to the public internet.

