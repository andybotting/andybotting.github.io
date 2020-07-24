---
id: 419
title: Using pkgutil on Solaris with Puppet for easy package management
date: 2010-12-10T03:18:10+00:00
author: Andy Botting
layout: post
permalink: /using-pkgutil-on-solaris-with-puppet-for-easy-package-management
aktt_notify_twitter:
  - 'no'
categories:
  - Geek
tags:
  - Linux
  - puppet
  - solaris
---
I&#8217;ve been using [Puppet](http://www.puppetlabs.com) on Linux systems for some time now, but I&#8217;ve only just started using it in a Solaris environment.

I think one of the killer functions of Puppet is being able to easily install packages and manage services on a system. Most Linux distros these days have tools for working with repositories of packages, like Yum on Fedora/RedHat/CentOS and Apt on Debian and Ubuntu. These work really well with Puppet, because you can easily script a class which requires a specific package, and Puppet will just call the package tool and it&#8217;ll install the right package and all of the required dependencies.

Using Solaris feels like a step back from Linux, not having an official repository tool like Yum and Apt. Its package system seems quite primitive which can suffer from the dependency hell that we used to have with RPM before it was wrapped up with Yum. Enter: **pkgutil**.

[Pkgutil](http://pkgutil.wikidot.com/) is like Yum for Solaris, written in Perl by Peter Bonivart. It was designed for [OpenCSW](http://www.opencsw.org/), which is a repository for Open Source packages on Solaris &#8211; and also the best place to install Puppet from. With a few simple steps, you can actually build an OpenCSW compatible repository of Solaris packages and tell pkgutil to use it, rather than the standard OpenCSW one.

Puppet has almost gained a proper package provider for Pkgutil (See [Puppet issue #4258: Add pkgutil provider)](http://projects.puppetlabs.com/issues/4258), which should be available in Puppet 2.6.4 maybe. In the mean time, we can just install it into our Ruby path to make use of it right now.

Steps involved are:

  * Install pkgutil
  * Install Puppet on Solaris
  * Install the pkgutil provider
  * Build an OpenCSW-compatible repository of your own packages
  * Define pkgutil as a provder in your Puppet configuration
  * Install some packages!



## Install pkgutil

Before we do anything, we should install pkgutil. This handy one-liner will install it for Solaris 10 and OpenSolaris.

``# pkgadd -d http://mirror.opencsw.org/opencsw/pkgutil-`uname -p`.pkg``

For Solaris 8 and 9, take a look at the [pkgutil installation page](http://www.opencsw.org/get-it/pkgutil/) for more details.



## Install Puppet

Now that pkgutil is installed, installing Puppet is a breeze!

`# /opt/csw/bin/pkgutil --install puppet`

This will resolve all the dependencies and install everything just like the Linux package management tools do.



## Install the pkgutil provider

I&#8217;m using a version of pkgutil from Dominic Cleal&#8217;s git repository.

`# wget --no-check-certificate https://github.com/domcleal/puppet/raw/143fc744a839affd328234fca26246d49d15d3d8/lib/puppet/provider/package/pkgutil.rb -O /opt/csw/lib/ruby/site_ruby/1.8/puppet/provider/package/pkgutil.rb`

This wget will download it, and copy into the right place in the filesystem for Puppet to pick it up.



## Build an OpenCSW-compatible repository

As part of OpenCSW, Peter Bonivart has released a tool for creating OpenCSW repositories, called [bldcat](http://pkgutil.wikidot.com/bldcat). You can find it as part of the pkgutilplus package from OpenCSW.

Create yourself a new directory for your packages on your webserver. For me, I needed OpenSolaris 2009.06 and Solaris 10 support, so:

`# mkdir -p repo/solaris/i386/5.11/<br />
# mkdir -p repo/solaris/i386/5.10/`

Then just put all your packages into that directory, and run bldcat:

`# bldcat .`

This will generate the catalog, and descriptions file needed for pkgutil. Once you make this directory available by HTTP, you can add the URL into the pkgutil.conf file.

One thing to remember is that you&#8217;ll need to do this on a Solaris machine. Although bldcat will work on Linux, it requires some of the Solaris package tools, which won&#8217;t be available. For me, I just did it NFS mounted from a Linux server.

Now, set the mirror and noncsw entries like this:

`mirror=http://repo.mydomain/repo/solaris<br />
noncsw=true`

For my situation, I had to include a few packages that we provided as our standard environment, and the package names weren&#8217;t prefixed with CSW, to the &#8216;noncsw&#8217; option needs to be set.

Because I wanted a mix of OpenCSW packages and our corporate standard packages, I copied in the OpenCSW packages (and dependencies) along with the corporate ones into the one repository. You can put Puppet in there also.

NOTE: All your packages need to be *.pkg.gz format, so make sure you compress any packages that aren&#8217;t already gzipped!



## Define pkgutil as a provider in your Puppet configuration

In the site.pp file on my Puppet Master, I include this definition:

<pre>Package {
    provider => $operatingsystem ? {
        redhat => yum,
        centos => yum,
        sles => zypper,
        solaris => pkgutil,
    }
}
</pre>

To see this in action, I&#8217;ve used Nagios&#8217;s NRPE as an example.

<pre>package { nrpe_package:
  name => $operatingsystem ? {
    Solaris => 'CSWnrpe'
    CentOS  => 'nrpe',
    SLES    => 'nagios-nrpe',
    Debian  => 'nagios-nrpe-server',
  },
  ensure => installed,
}
</pre>

So with pkgutil, installing packages on Solaris can be as easy as Linux with Puppet.