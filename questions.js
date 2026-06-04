const questions = [

{
id:1,
category:"systemd",
question:"systemdでサービスを起動するコマンドは？",
choices:["service up","systemctl start","runsvc","bootctl"],
answer:1,
explanation:"systemctl start サービス名 を使用する。"
},

{
id:2,
category:"systemd",
question:"サービスの自動起動を有効化するコマンドは？",
choices:["systemctl enable","systemctl boot","systemctl run","chkconfig start"],
answer:0,
explanation:"systemctl enableで次回起動時から自動起動となる。"
},

{
id:3,
category:"systemd",
question:"サービス状態確認コマンドは？",
choices:["ps aux","service show","systemctl status","journalctl"],
answer:2,
explanation:"systemctl statusで状態確認できる。"
},

{
id:4,
category:"ssh",
question:"SSHの標準ポート番号は？",
choices:["21","443","22","25"],
answer:2,
explanation:"SSHはTCP22番ポート。"
},

{
id:5,
category:"ssh",
question:"SSHサーバ設定ファイルは？",
choices:[
"/etc/ssh/sshd_config",
"/etc/ssh/ssh.conf",
"/etc/sshd.conf",
"/etc/network/ssh.conf"
],
answer:0,
explanation:"OpenSSHサーバ設定はsshd_config。"
},

{
id:6,
category:"filesystem",
question:"パーミッション変更コマンドは？",
choices:["chown","chmod","umask","passwd"],
answer:1,
explanation:"chmodでアクセス権を変更する。"
},

{
id:7,
category:"filesystem",
question:"所有者変更コマンドは？",
choices:["chmod","mount","chown","owner"],
answer:2,
explanation:"chownで所有者を変更する。"
},

{
id:8,
category:"filesystem",
question:"現在のディレクトリを表示するコマンドは？",
choices:["pwd","ls","cd","where"],
answer:0,
explanation:"pwdはPrint Working Directory。"
},

{
id:9,
category:"filesystem",
question:"ファイル検索コマンドは？",
choices:["grep","find","search","scan"],
answer:1,
explanation:"findは条件指定検索を行う。"
},

{
id:10,
category:"filesystem",
question:"ディスク使用量確認コマンドは？",
choices:["du","df","fdisk","lsblk"],
answer:1,
explanation:"dfはファイルシステム使用量表示。"
},

{
id:11,
category:"filesystem",
question:"ディレクトリ容量確認コマンドは？",
choices:["du","df","mount","blkid"],
answer:0,
explanation:"duはディレクトリ単位で容量表示。"
},

{
id:12,
category:"filesystem",
question:"シンボリックリンク作成コマンドは？",
choices:["ln -s","link","mklink","symlink"],
answer:0,
explanation:"ln -sでシンボリックリンク作成。"
},

{
id:13,
category:"boot",
question:"GRUB2設定生成コマンドは？",
choices:[
"grub-install",
"grub-mkconfig",
"bootcfg",
"grub-update"
],
answer:1,
explanation:"grub-mkconfigで設定生成。"
},

{
id:14,
category:"boot",
question:"GRUB2インストールコマンドは？",
choices:[
"grub-install",
"grub-mkconfig",
"mkgrub",
"boot-install"
],
answer:0,
explanation:"grub-installでブートローダを配置。"
},

{
id:15,
category:"kernel",
question:"ロード済みカーネルモジュール確認コマンドは？",
choices:["modprobe","lsmod","depmod","insmod"],
answer:1,
explanation:"lsmodはロード済みモジュール一覧表示。"
},

{
id:16,
category:"kernel",
question:"モジュールロードコマンドは？",
choices:["insmod","lsmod","depmod","rmmod"],
answer:0,
explanation:"insmodでモジュールをロードする。"
},

{
id:17,
category:"kernel",
question:"モジュール削除コマンドは？",
choices:["depmod","lsmod","rmmod","delmod"],
answer:2,
explanation:"rmmodでモジュール削除。"
},

{
id:18,
category:"network",
question:"IPアドレス確認コマンドは？",
choices:["ifconfig","ip addr","route","arp"],
answer:1,
explanation:"近年はip addrが標準。"
},

{
id:19,
category:"network",
question:"経路情報表示コマンドは？",
choices:["route","ip route","netstat -s","host"],
answer:1,
explanation:"ip routeでルーティング確認。"
},

{
id:20,
category:"network",
question:"疎通確認コマンドは？",
choices:["host","dig","ping","arp"],
answer:2,
explanation:"pingでICMP疎通確認。"
},

{
id:21,
category:"dns",
question:"DNS問い合わせコマンドは？",
choices:["dig","mount","fdisk","du"],
answer:0,
explanation:"digでDNS問い合わせを行う。"
},

{
id:22,
category:"dns",
question:"DNSサーバソフトは？",
choices:["Apache","Bind","Postfix","Dovecot"],
answer:1,
explanation:"BINDは代表的DNSサーバ。"
},

{
id:23,
category:"web",
question:"Apache設定ファイルは？",
choices:[
"/etc/httpd/conf/httpd.conf",
"/etc/apache.conf",
"/etc/http.conf",
"/etc/httpd.conf"
],
answer:0,
explanation:"代表的なApache設定ファイル。"
},

{
id:24,
category:"web",
question:"Apache再起動コマンドは？",
choices:[
"systemctl restart httpd",
"httpd restart",
"apache reboot",
"service apache boot"
],
answer:0,
explanation:"systemctl restart httpd。"
},

{
id:25,
category:"mail",
question:"代表的MTAは？",
choices:["Dovecot","Postfix","Bind","Apache"],
answer:1,
explanation:"PostfixはMTA。"
},

{
id:26,
category:"mail",
question:"IMAPサーバとして利用されるソフトは？",
choices:["Dovecot","Bind","Samba","Apache"],
answer:0,
explanation:"DovecotはIMAP/POP3サーバ。"
},

{
id:27,
category:"security",
question:"iptablesでルール表示するコマンドは？",
choices:[
"iptables -L",
"iptables show",
"iptables list",
"iptables status"
],
answer:0,
explanation:"iptables -Lで一覧表示。"
},

{
id:28,
category:"security",
question:"SELinux状態確認コマンドは？",
choices:[
"getenforce",
"setenforce",
"selinux",
"sestatus on"
],
answer:0,
explanation:"getenforceで状態確認。"
},

{
id:29,
category:"security",
question:"SELinuxをPermissiveへ変更するコマンドは？",
choices:[
"getenforce 0",
"setenforce 0",
"selinux off",
"disable selinux"
],
answer:1,
explanation:"setenforce 0はPermissive。"
},

{
id:30,
category:"storage",
question:"LVM物理ボリューム作成コマンドは？",
choices:["pvcreate","vgcreate","lvcreate","mkpv"],
answer:0,
explanation:"pvcreateでPV作成。"
},

{
id:31,
category:"storage",
question:"ボリュームグループ作成コマンドは？",
choices:["pvcreate","vgcreate","lvcreate","mkvg"],
answer:1,
explanation:"vgcreateでVG作成。"
},

{
id:32,
category:"storage",
question:"論理ボリューム作成コマンドは？",
choices:["lvcreate","vgcreate","pvcreate","mkfs"],
answer:0,
explanation:"lvcreateでLV作成。"
},

{
id:33,
category:"raid",
question:"LinuxソフトウェアRAID管理ツールは？",
choices:["mdadm","raidctl","lvm","mkraid"],
answer:0,
explanation:"mdadmが標準。"
},

{
id:34,
category:"samba",
question:"Samba設定ファイルは？",
choices:[
"/etc/samba/smb.conf",
"/etc/smb.conf",
"/etc/samba.conf",
"/etc/share.conf"
],
answer:0,
explanation:"smb.confが設定ファイル。"
},

{
id:35,
category:"nfs",
question:"NFSエクスポート設定ファイルは？",
choices:[
"/etc/exports",
"/etc/nfs.conf",
"/etc/share",
"/etc/mounts"
],
answer:0,
explanation:"/etc/exportsで公開設定。"
}

];
