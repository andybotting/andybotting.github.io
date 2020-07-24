---
id: 373
title: Using the Yubikey for two-factor authentication on Linux
date: 2010-05-20T22:47:30+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=373
permalink: /using-the-yubikey-for-two-factor-authentication-on-linux
aktt_notify_twitter:
  - 'no'
categories:
  - Personal
---
The Yubikey is a nice little device. It&#8217;s quite simple in design and operation. <img class="alignright size-full wp-image-388" title="Yubikey" src="http://www.andybotting.com/wordpress/wp-content/uploads/yubikey.jpg" alt="Yubikey" width="219" height="147" />

The key actually emulating a USB keyboard, which makes it instantly usable on any modern OS. You just press the button on the key to generate a one-time-password (OTP) to validate you. The method works by typing in your password, but before hitting the return key, you press the Yubikey button to finish it off. At the end of the OTP generation, it sends a carriage return itself.

The OTP is then sent to a validation server, either hosted by Yubico themselves, or you can host your own.

I&#8217;m going to walk through how you can set the infrastructre for doing two-factor authentication on Debian. In my specific case, the requirement was two-factor with an Active Directory username/password combination and the Yubikey as the second factor.

Unfortunately, the documentation from Yubico is quite average. To top it off, they insist on using multiple Google Code project sites for hosting their software.

This would normally be fine, but in this case, they have a Google Code project for every single little piece of code. Much of the documentation I found relates to older projects which are not supported by Yubico. This makes working out exactly what you need difficult. Within the Google Code project sites, documentation often runs in circles between projects.

In this document, I&#8217;ll look at using PAM to auth again the Yubico auth servers first. Once that&#8217;s working, I&#8217;ll move onto flashing the Yubikey with a new key and using our own Validation System.

**NOTE:** This is just some rough notes I put together. You should definitely read the Yubico documentation for this to really make sense.

# Authenticating with the Yubikey with PAM

Get some dependencies

<pre>apt-get install libpam-dev libcurl4-openssl-dev libpam-radius-auth</pre>

Make ourselves a source directory

<pre>mkdir ~/yubikey; cd ~/yubikey</pre>

Get the current tarball of libyubikey, and install it

<pre>wget http://yubico-c.googlecode.com/files/libyubikey-1.5.tar.gz
tar xf libyubikey-1.5.tar.gz
cd libyubikey-1.5
./configure
make check install</pre>

Get the current tarball of the Yubico C client, and install it

<pre>wget http://yubico-c-client.googlecode.com/files/ykclient-2.3.tar.gz
tar -xf ykclient-2.3.tar.gz
cd ykclient-2.3
./configure
make
make install</pre>

Get the current tarball of the Yubico PAM module, and install it

<pre>wget http://yubico-pam.googlecode.com/files/pam_yubico-2.3.tar.gz
tar -xf pam_yubico-2.3.tar.gz
cd pam_yubico-2.3
./configure
make
make install</pre>

You should end up with your Yubico PAM module &#8216;/usr/local/lib/security/pam_yubico.so&#8217;

We&#8217;ll refer to this in our PAM config /etc/pam.d/openvpn

<pre>#
# /etc/pam.d/openvpn - OpenVPN pam configuiration
#
# We fall back to the system default in /etc/pam.d/common-*
#
auth required /usr/local/lib/security/pam_yubico.so id=1 debug authfile=/etc/yubikeyid
auth required pam_radius_auth.so no_warn try_first_pass
@include common-account
@include common-password
@include common-session</pre>

This configuration will tell PAM to hit the Yubico module first. This splits apart your password field into your password and OTP. The OTP is validated against the Validation Servers, and the password is then passed onto the next module. This configuration will use the Yubico auth servers to check your token.

Once you have a working config, we&#8217;ll move to setting up our own Validation Servers. We&#8217;ll need to specify the URL for that in this config later on.

In that case, we&#8217;re also using RADIUS. This could be LDAP if you had an LDAP server available. You should be able to use the standard UNIX credentials (/etc/password, /etc/shadow) also.

The other important piece to note here is the authfile, /etc/yubikeyid

This file lists the mapping between username and the fixed part of your Yubikey. This is the first 12 chars of the Yubikey OTP (e.g. when you press the button)

<pre>abotting:vvcnrdkvevtj</pre>

# FreeRADIUS authenticating against Active Directory 2008.

I banged my head against a wall for a while on this one. The trick is that you need at least FreeRADIUS 2.1.6 for AD authentication to work properly.

Add Debian backports to your /etc/apt/sources.list

<pre>deb http://www.backports.org/debian lenny-backports main contrib non-free</pre>

Import the backports key

<pre>wget -O - http://backports.org/debian/archive.key | apt-key add -</pre>

Update and install the new freeradius

<pre>apt-get update
apt-get -t lenny-backports install freeradius freeradius-ldap</pre>

In your radiusd.conf

<pre>ldap {
    # Define the LDAP server and the base domain name
    server = "ad.yourcompany.com"
    basedn = "dc=ad, dc=yourcompany, dc=com"

    # Active Directory doesn't allow for Anonymous Binding
    identity = "ldap_bind_user@ad.yourcompany.com"
    password = password

    password_attribute = "userPassword"
    filter = "(&(sAMAccountname=%{Stripped-User-Name:-%{User-Name}})(memberOf=CN=Users,DC=ad,DC=yourcompany,DC=com))"

    # This fixes Active Directory 2008 access
    chase_referrals = yes
    rebind = yes

    # The following are RADIUS defaults
    start_tls = no
    dictionary_mapping = ${raddbdir}/ldap.attrmap
    ldap_connections_number = 5
    timeout = 4
    timelimit = 3
    net_timeout = 1
}</pre>

In our FreeRADIUS client file /etc/freeradius/clients.conf:

<pre>client localhost {
    ipaddr = 127.0.0.1
    secret = testing123
    nastype = other
}</pre>

Use radtest to test our RADIUS is authenticating properly

<pre>radtest &lt;username&gt; &lt;password&gt; localhost 1 testing123</pre>

Should return Accept.

Set the address and shared secret of the radius server in **/etc/pam\_radius\_auth.conf**. The password of testing123 was defined in our RADIUS client config.

<pre># server[:port] shared_secret   timeout (s)
127.0.0.1       testing123      1</pre>

OpenVPN has an issue with PAM loading the Yubikey module, so we have to LD_PRELOAD the pam module before starting OpenVPN.

<pre>export LD_PRELOAD=/lib/libpam.so.0.81.12; openvpn --config openvpn.conf</pre>

For a permanent fix, at the end of the start_vpn function in /etc/init.d/openvpn, just before the $DAEMON line:

<pre>export LD_PRELOAD=/lib/libpam.so.0.81.12
    $DAEMON $OPTARGS --writepid /var/run/openvpn.$NAME.pid \
        $DAEMONARG $STATUSARG --cd $CONFIG_DIR \
        --config $CONFIG_DIR/$NAME.conf || STATUS=1</pre>

Change the path of /lib/libpam.so.0.81.12 to suit your own system.

I won&#8217;t go into the OpenVPN configuration, except that for PAM authentication you need these options in your server config:

<pre>plugin /usr/lib/openvpn/openvpn-auth-pam.so openvpn
username-as-common-name
ns-cert-type server
client-cert-not-required</pre>

# Personalising your Yubikey

To host your own Yubikey validation system, you require the secret AES key of your Yubikey. In the past, Yubico could provide this to you. Now, you&#8217;re required to flash your Yubikey yourself which will generate a new AES key.

Yubico provide a personalisation tool for Linux, Mac and Windows. If you&#8217;re on Windows, you get a nice little GUI. For Linux and Mac, you have a CLI based tool. It&#8217;s worth having a look at the &#8216;Personalization Tool&#8217; page at: <http://www.yubico.com/developers/personalization/>

## Installing the Personalisation Tool

Install some dependencies:

<pre>apt-get install libusb-1.0.0-dev</pre>

Grab the latest Pesonalisation Tool tarball from: http://code.google.com/p/yubikey-personalization/

<pre>cd ~/yubikey
wget http://yubico-c.googlecode.com/files/libyubikey-1.5.tar.gz</pre>

Extract, build and install libyubikey

<pre>tar xf libyubikey-1.5.tar.gz
cd libyubikey-1.5
./configure
make
make install</pre>

You&#8217;ll need to provide a UID value for flashing your Yubikey. It needs to be 6 characters, and in hexadecimal. You can use this command to generate one for you.

<pre>dd if=/dev/urandom of=/dev/stdout count=100 2&gt;/dev/null | xargs -0 modhex | cut -c 1-10 | awk '{print "vv" $1}'
74657374696e</pre>

You must provide the public name (fixed) parameter in modhex format. The modhex format is a special encoding used to ensure characters sent by the key are always correctly interpreted whatever keyboard layout you use.

You also need to generate yourself a public name for your key. This is known as the &#8216;fixed&#8217; part, and it&#8217;ll be the first 16 chars when you generate your OTP. This will identify your key from anybody else&#8217;s.

<pre>dd if=/dev/urandom of=/dev/stdout count=100 2&gt;/dev/null | xargs -0 modhex | cut -c 1-10 | awk '{print "vv" $1}'
vvcnrdkvevtj</pre>

This comamnd generate some random text, does a modhex operation, grabs the first 10 chars, then adds &#8216;vv&#8217; to the front to make it up to 12.

You&#8217;ll be prompted for a passphrase on your AES key. I leave mine blank, but if you do set one, don&#8217;t ever lose it. I believe it&#8217;ll stop you from re-personalising your Yubikey.

<pre>ykpersonalize -ouid=74657374696e -ofixed=vvcnrdkvevtj
Firmware version 2.1.2 Touch level 1793 Program sequence 1
Passphrase to create AES key:
Configuration data to be written to key configuration 1:
fixed: m:vvcnrdkvevtj
uid: h:74657374696e
key: h:fcaad309a20ne1809c2db2f7f0e8d6ea
acc_code: h:000000000000
ticket_flags: APPEND_CR
config_flags:

Commit? (y/n) [n]: y</pre>

Save this information, as we&#8217;ll need it later.

# Setting up yor own YubiKey OTP Validation Server

You need to install two things: The Key Storage Module and the Yubico Validation Server. The Key Storage Module (KSM) holds the secret AES key of your Yubikey token, while the Validation Server does the OTP check against the KSM.

In their 2.0 architecture, you can have multiple KSM&#8217;s and Validation servers with work together for reduncancy.

## KSM Installation

Make a working directory, and get the KSM package

<pre>mkdir ~/yubikey && cd ~/yubikey
wget http://yubikey-ksm.googlecode.com/files/yubikey-ksm-1.3.tgz
tar xfz yubikey-ksm-1.3.tgz</pre>

Install the KSM files

<pre>cd yubikey-ksm-1.3
make install</pre>

## Install Apache2 and PHP

Install Apache2, PHP and MySQL

<pre>apt-get install apache2 php5 php5-mcrypt php5-curl mysql-server php5-mysql libdbd-mysql-perl</pre>

Create the ykksm table

<pre>echo "CREATE DATABASE ykksm;" | mysql -u root -p</pre>

Import the DB schema

<pre>mysql -u root -p ykksm &lt; /usr/share/doc/ykksm/ykksm-db.sql</pre>

Set up some MySQL permissions

<pre>CREATE USER 'ykksmreader';
GRANT SELECT ON ykksm.yubikeys TO 'ykksmreader'@'localhost';
SET PASSWORD FOR 'ykksmreader'@'localhost' = PASSWORD('hYea3Inb');

CREATE USER 'ykksmimporter';
GRANT INSERT ON ykksm.yubikeys TO 'ykksmimporter'@'localhost';
SET PASSWORD FOR 'ykksmimporter'@'localhost' = PASSWORD('ikSab29');

FLUSH PRIVILEGES;</pre>

## Include path configuration

Set the include path by creating a file /etc/php5/conf.d/ykksm.ini

<pre>cat &gt; /etc/php5/conf.d/ykksm.ini &lt;&lt; EOF
include_path = "/etc/ykksm:/usr/share/ykksm"
EOF</pre>

Make a web server symlink

<pre>make -f /usr/share/doc/ykksm/ykksm.mk symlink</pre>

Set your configuration settings in /etc/ykksm/ykksm-config.php

<pre>&lt;?php
  $db_dsn      = "mysql:dbname=ykksm;host=127.0.0.1";
  $db_username = "ykksmreader";
  $db_password = "hYe63Inb";
  $db_options  = array();
  $logfacility = LOG_LOCAL0;
?&gt;</pre>

Restart Apache2

<pre>/etc/init.d/apache2 restart</pre>

## Test the KSM Server

Try this URL:

<pre>curl 'http://localhost/wsapi/decrypt?otp=dteffujehknhfjbrjnlnldnhcujvddbikngjrtgh'
ERR Unknown yubikey</pre>

It should return &#8216;Unknown Key&#8217; until we have imported our Yubikey into the database.

# Install the Yubico Validation Server

The latest version, and documentation can be found at: <http://code.google.com/p/yubikey-val-server-php/>

## Installation

Go to our working source directory, and grab the package

<pre>cd ~/yubikey
wget http://yubikey-val-server-php.googlecode.com/files/yubikey-val-2.4.tgz</pre>

Extract, build and install the server

<pre>tar -zxf yubikey-val-2.4.tgz
cd yubikey-val-2.4
make install</pre>

Create the ykval database and import the schema

<pre>echo 'create database ykval' | mysql -u root -p
mysql -u root -p ykval &lt; /usr/share/doc/ykval/ykval-db.sql</pre>

Install the symlink

<pre>make symlink</pre>

Include path configuration

<pre>cat &gt; /etc/default/ykval-queue &lt;&lt; EOF
DAEMON_ARGS="/etc/ykval:/usr/share/ykval
EOF</pre>

Create a htaccess file: /var/www/wsapi/2.0/.htaccess

<pre>RewriteEngine on
RewriteRule ^([^/\.\?]+)(\?.*)?$ $1.php$2 [L]</pre>

<pre>php_value include_path ".:/etc/ykval:/usr/share/ykval"</pre>

Symlink the htaccess file

<pre>cd /var/www/wsapi; ln -s 2.0/.htaccess /var/www/wsapi/.htaccess</pre>

Copy the template config file for the Validation Server

<pre>cp /etc/ykval/ykval-config.php-template /etc/ykval/ykval-config.php</pre>

Edit the file and configure settings in /etc/ykval/ykval-config.php

<pre>&lt;?php

  # For the validation interface.
  $baseParams = array ();
  $baseParams['__YKVAL_DB_DSN__'] = "mysql:dbname=ykval;host=127.0.0.1";
  $baseParams['__YKVAL_DB_USER__'] = 'ykvalverifier';
  $baseParams['__YKVAL_DB_PW__'] = 'password';
  $baseParams['__YKVAL_DB_OPTIONS__'] = array();

  # For the validation server sync
  $baseParams['__YKVAL_SYNC_POOL__'] = array("http://localhost/wsapi/2.0/sync");

  # An array of IP addresses allowed to issue sync requests
  # NOTE: You must use IP addresses here.
  $baseParams['__YKVAL_ALLOWED_SYNC_POOL__'] = array("127.0.0.1");

  # Specify how often the sync daemon awakens
  $baseParams['__YKVAL_SYNC_INTERVAL__'] = 10;

  # Specify how long the sync daemon will wait for response
  $baseParams['__YKVAL_SYNC_RESYNC_TIMEOUT__'] = 30;

  # Specify how old entries in the database should be considered aborted attempts
  $baseParams['__YKVAL_SYNC_OLD_LIMIT__'] = 10;

  # These are settings for the validation server.
  $baseParams['__YKVAL_SYNC_FAST_LEVEL__'] = 1;
  $baseParams['__YKVAL_SYNC_SECURE_LEVEL__'] = 40;
  $baseParams['__YKVAL_SYNC_DEFAULT_LEVEL__'] = 60;
  $baseParams['__YKVAL_SYNC_DEFAULT_TIMEOUT__'] = 1;

  // otp2ksmurls: Return array of YK-KSM URLs for decrypting OTP for
  // CLIENT.  The URLs must be fully qualified, i.e., contain the OTP
  // itself.
  function otp2ksmurls ($otp, $client) {
    return array("http://localhost/wsapi/decrypt?otp=$otp",);
  }
?&gt;</pre>

In the above configuration, we&#8217;re only expecting to use one Validation Server and one KSM. If you&#8217;re planning on having multiple Validation servers and KSM&#8217;s, then you&#8217;ll be including the other Validation Servers in the SYNC_POOL, and your KSM&#8217;s in the URLs at the bottom, returned by the otp2ksmurls function.

Enable the mod_rewrite

<pre>a2enmod rewrite</pre>

Create the ykval database user

<pre>CREATE USER 'ykvalverifier'@'localhost' IDENTIFIED BY  'password';
GRANT ALL PRIVILEGES ON `ykval`. * TO  'ykvalverifier'@'localhost';</pre>

Fix some privileges on our config file

<pre>chgrp www-data /etc/ykval/ykval-config.php</pre>

The Sync Daemon uses the PEAR module System_Daemon so you need to install it:

<pre>apt-get install php-pear
pear install System_Daemon-0.9.2</pre>

Install the init.d script

<pre>ykval-queue install
update-rc.d -f ykval-queue defaults</pre>

Start the daemon

<pre>/etc/init.d/ykval-queue start</pre>

## Testing

Use CURL to test our server is working

<pre>curl 'http://localhost/wsapi/verify?id=1&otp=vvcnrdkvevtefjbrjnlnldnhcujvddbikngjrtgh'</pre>

It should return something like this:

<pre>h=aPCQ4kWJilDgriyEii3j8J8lfuY=
t=2009-04-27T19:08:51Z0100
status=NO_SUCH_CLIENT</pre>

Once we import our Yubikey into the database, we should get a nice &#8216;status=OK&#8217; message.

## Importing your keys into the KSM server

Refer back to the output from personalising your Yubikey. You&#8217;ll need the fixed part (referred to as publicname in the DB), internal name (UID) and our AES key.

This is an entry for our newly personalised Yubikey.

<pre>USE ykksm;
INSERT INTO `yubikeys` (`serialnr`, `publicname`, `created`, `internalname`, `aeskey`, `lockcode`, `creator`, `active`, `hardware`)
VALUES (101209, 'vvcnrdkvevtj', '2010-05-07 15:18:40', '74657374696e', 'fcaad309a20ne1809c2db2f7f0e8d6ea', '000000000000', '', 1, 1);</pre>

This entry is required for our systems to authenticate against the Validation server. I&#8217;m not exactly sure about this, as the documentation is somewhat bare. I think you need an administrator-type person&#8217;s key details in here. The imporant part is the ID. This values corresponds the the &#8216;id=&#8217; value in our CURL requests and in our PAM config.

<pre>USE ykval;
INSERT INTO `clients`
(`id`, `active`, `created`, `secret`, `email`, `notes`, `otp`)
VALUES
(1, 1, 1, 'fcaad309a20ne1809c2db2f7f0e8d6ea', 'your@email.addr', 'Any text your want', 'vvcnrdkvevterfbtelvnvkkueenecrlfnlhdjetrhgnk');</pre>

We&#8217;ll hit our new Validation Server to make sure it&#8217;s working

<pre>curl "http://localhost/wsapi/2.0/verify?id=1&nonce=askjdnvajsndjkasndvjsnad&otp=vvcnrdkvevtjkreuvvlhtubjecbrticjneckgrigkck"
h=KLEb3gOJ4KqQaCVbh8cEvXjH50U=</pre>

It should return something like this:

<pre>t=2010-05-20T11:24:53Z0051
otp=vvvcnrdkvevtjkreuvvlhtubjecbrticjneckgrigkck
nonce=askjdnvajsndjkasndvjsnad
sl=100
status=OK</pre>

In this URL, we&#8217;ve added the &#8216;nonce&#8217; parameter. This just a test to make sure the v2.0 API is working. &#8216;status=OK&#8217; means it&#8217;s all good! If you get &#8216;NOT\_ENOUGH\_ANSWERS&#8217;, it means it has trouble trying to sync with other Validation Servers.

We&#8217;ll get PAM using our new Validation Servers for auth

/etc/pam.d/openvpn

<pre>auth required /usr/local/lib/security/pam_yubico.so id=1 authfile=/etc/yubikeyid url=http://10.68.130.198/wsapi/verify?id=%d&otp=%s debug</pre>

If you watch /var/log/auth.log, you should see the PAM module spitting out some debugging information which may be useful. It also spits out your plain text password too, while you have the debug option on. Make sure you remove this later.

# Problems

If you see an error like this:

<pre>PAM unable to dlopen(/lib/security/pam_yubico.so): /lib/security/pam_yubico.so: undefined symbol: pam_set_data</pre>

you&#8217;ll need the LD_PRELOAD trick from above. Something to do with dlopening the PAM module I believe.