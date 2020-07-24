---
id: 463
title: Puppet filebucketing fail with NFS
date: 2012-09-27T14:09:28+00:00
author: Andy Botting
layout: post
permalink: /puppet-filebucketing-fail-with-nfs
aktt_notify_twitter:
  - 'no'
categories:
  - Personal
---
I&#8217;ve got back to Australia and I&#8217;m continuing my UK job from home.

So yesterday, I was doing some cleaning up and needed to unmount an NFS share and clean up its mount point directory.

You can see from the Puppet code below that I marked both resources as &#8216;absent&#8217; to clean them up.

<pre>file { '/tmp/install':
    ensure   =&gt; 'absent'
}
mount { '/tmp/install':
    ensure   =&gt; 'absent',
    device   =&gt; nfs-server:/install,
    fstype   =&gt; nfs
}</pre>

This triggered Puppet to start filebucketing everything it could from the NFS share and subsequently filling up the root filesystem. I managed to revert my commit fairly quickly, but a large number of hosts in our infrastructure had already picked this up. This included both development and production systems.

There is an existing Puppet bug report about the issue at <http://projects.puppetlabs.com/issues/2019>

Apart from the obvious mistake that I should have just run this in a test environment first, this was totally unexpected behaviour.

A couple of things you could do to prevent this happening to you:

  1. Disable filebucketing either globally, or just for this file resource
  2. Don&#8217;t try to remove the NFS mount and directory at the same time

Hope this helps.