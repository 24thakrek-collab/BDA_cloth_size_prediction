# Apache Hadoop HDFS Setup Guide: Pseudo-Distributed Mode

This document provides step-by-step instructions for configuring and running **Apache Hadoop 3.3.6** in **Pseudo-Distributed Mode** on a Linux/Unix machine. In this mode, each Hadoop daemon (NameNode, DataNode, SecondaryNameNode, ResourceManager, NodeManager) runs in a separate Java process on a single node, simulating a real distributed cluster.

---

## 1. Prerequisites and System Requirements

- **Operating System:** Ubuntu 20.04/22.04 LTS, Debian 11/12, or macOS with Homebrew
- **Java:** OpenJDK 8 or OpenJDK 11 (Hadoop 3.3.x is fully certified with Java 8/11)
- **SSH:** OpenSSH server and client (for passwordless localhost SSH)
- **Storage:** Minimum 10 GB free disk space for HDFS block storage

### Install Dependencies (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y openjdk-11-jdk ssh pdsh rsync curl
```

Verify Java installation:
```bash
java -version
# Expected: openjdk version "11.0.x"
readlink -f /usr/bin/java | sed "s:bin/java::"
# Returns JAVA_HOME, e.g., /usr/lib/jvm/java-11-openjdk-amd64/
```

---

## 2. Configure Passwordless SSH

Hadoop startup scripts (`start-dfs.sh`, `start-yarn.sh`) communicate with cluster nodes via SSH, even on localhost.

```bash
# Generate SSH key pair without passphrase
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa

# Authorize key for localhost
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys

# Test SSH connection without password prompt
ssh localhost
# Type 'exit' after successful connection
```

---

## 3. Download and Extract Apache Hadoop

```bash
# Set installation directory
export HADOOP_VERSION=3.3.6
cd /opt || cd ~

# Download official Apache binary release
curl -O https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz

# Extract archive
tar -xzf hadoop-${HADOOP_VERSION}.tar.gz
sudo mv hadoop-${HADOOP_VERSION} /usr/local/hadoop

# Set permissions for current user
sudo chown -R $USER:$USER /usr/local/hadoop
```

---

## 4. Configure Environment Variables (`~/.bashrc`)

Add the following export statements to the end of your `~/.bashrc` (or `~/.zshrc` on macOS):

```bash
# Hadoop & Java Environment Variables
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop

# PySpark Environment
export SPARK_HOME=/usr/local/spark
export PATH=$PATH:$SPARK_HOME/bin
export PYSPARK_PYTHON=python3
```

Apply the changes immediately:
```bash
source ~/.bashrc
```

Verify the Hadoop CLI is accessible:
```bash
hadoop version
```

---

## 5. Configure Hadoop XML Configuration Files

Navigate to `$HADOOP_HOME/etc/hadoop/`:

### A. Set `JAVA_HOME` in `hadoop-env.sh`
Edit `$HADOOP_HOME/etc/hadoop/hadoop-env.sh` and set:
```bash
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
```

### B. Core Configuration (`core-site.xml`)
Edit `$HADOOP_HOME/etc/hadoop/core-site.xml`:
```xml
<configuration>
    <!-- Default FileSystem URI for HDFS NameNode -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
        <description>The NameNode URI where PySpark and HDFS CLI connect.</description>
    </property>
    <!-- Temporary base directory for Hadoop runtime data -->
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/home/${user.name}/hadoop_data/tmp</value>
        <description>Parent directory for HDFS storage blocks.</description>
    </property>
</configuration>
```

### C. HDFS Configuration (`hdfs-site.xml`)
Edit `$HADOOP_HOME/etc/hadoop/hdfs-site.xml`:
```xml
<configuration>
    <!-- Replication factor: 1 for pseudo-distributed single node -->
    <property>
        <name>dfs.replication</name>
        <value>1</value>
        <description>Default block replication count.</description>
    </property>
    <!-- NameNode metadata directory -->
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:///home/${user.name}/hadoop_data/hdfs/namenode</value>
    </property>
    <!-- DataNode block storage directory -->
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///home/${user.name}/hadoop_data/hdfs/datanode</value>
    </property>
    <!-- WebHDFS REST API enablement -->
    <property>
        <name>dfs.webhdfs.enabled</name>
        <value>true</value>
    </property>
</configuration>
```

### D. YARN Configuration (`yarn-site.xml`)
Edit `$HADOOP_HOME/etc/hadoop/yarn-site.xml`:
```xml
<configuration>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.env-whitelist</name>
        <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_MAPRED_HOME</value>
    </property>
</configuration>
```

---

## 6. Format the HDFS NameNode

**Important:** Format only once before the initial cluster startup. Formatting an existing cluster will erase the HDFS filesystem namespace.

```bash
# Create local storage directories
mkdir -p ~/hadoop_data/hdfs/namenode
mkdir -p ~/hadoop_data/hdfs/datanode
mkdir -p ~/hadoop_data/tmp

# Format NameNode filesystem
hdfs namenode -format
```

Look for the log message:
```
INFO common.Storage: Storage directory ... has been successfully formatted.
INFO namenode.FSImage: Saving image file ...
INFO namenode.NameNode: SHUTDOWN_MSG: Shutting down NameNode at ...
```

---

## 7. Start Hadoop Services

### Start HDFS Daemons (NameNode, DataNode, SecondaryNameNode)
```bash
start-dfs.sh
```

### Start YARN Daemons (ResourceManager, NodeManager)
```bash
start-yarn.sh
```

### Verify Running Daemons with `jps`
Run the Java Virtual Machine Process Status Tool:
```bash
jps
```

Expected output (all 5 daemons must be present):
```
51204 NameNode
51382 DataNode
51610 SecondaryNameNode
51920 ResourceManager
52055 NodeManager
52210 Jps
```

---

## 8. Web User Interfaces

Open your browser to access the Hadoop administrative consoles:

- **HDFS NameNode UI:** [http://localhost:9870](http://localhost:9870)
  - Inspect cluster storage capacity, live DataNodes, HDFS file browser (`/explorer.html`), and block metrics.
- **DataNode UI:** [http://localhost:9864](http://localhost:9864)
- **YARN ResourceManager:** [http://localhost:8088](http://localhost:8088)
- **Spark Job UI (active job):** [http://localhost:4040](http://localhost:4040)

---

## 9. Initialize Project Directories in HDFS

Run these commands to provision the project workspace:

```bash
# Create user root directory
hdfs dfs -mkdir -p /user/cloth

# Create project subdirectories
hdfs dfs -mkdir -p /user/cloth/input
hdfs dfs -mkdir -p /user/cloth/processed
hdfs dfs -mkdir -p /user/cloth/models
hdfs dfs -mkdir -p /user/cloth/predictions
hdfs dfs -mkdir -p /user/cloth/metrics

# Verify directory structure
hdfs dfs -ls /user/cloth
```

---

## 10. Stopping Hadoop Daemons

When finished with development:
```bash
stop-yarn.sh
stop-dfs.sh
```

---

## 11. Troubleshooting Common Issues

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **`DataNode not starting`** | ClusterID mismatch between NameNode and DataNode after multiple format calls | Delete `~/hadoop_data/hdfs/datanode` and re-run `hdfs datanode` or reformat cleanly. |
| **`NameNode in Safe Mode`** | HDFS has not received minimum block reports upon startup | Run `hdfs dfsadmin -safemode leave` to force exit safe mode. |
| **`Connection refused to localhost:9000`** | NameNode daemon is stopped or listening on incorrect IP | Check `jps` to see if NameNode is running. Inspect `$HADOOP_HOME/logs/hadoop-*-namenode-*.log`. |
| **`Permission denied: user=...`** | HDFS permission checking enabled for a non-superuser | Add `<property><name>dfs.permissions.enabled</name><value>false</value></property>` to `hdfs-site.xml` for development. |
