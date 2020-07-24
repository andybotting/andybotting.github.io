---
id: 400
title: 'Tram Hunter: the blog post'
date: 2010-09-14T19:02:00+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/wordpress/?p=400
permalink: /tram-hunter-the-blog-post
aktt_notify_twitter:
  - 'no'
categories:
  - Geek
---
I think this post has been a **long** time in the making, but I thought it might be time to share this little story.

**Tram Hunter** is a project I started nearly 2 years ago. It&#8217;s an Android client to the [Yarra Trams](http://www.yarratrams.com.au) **TramTracker** web service, which their iPhone client leaverages to provide real-time tram arrival information to users of trams in Melbourne.

I&#8217;m not sure what it is about Trams, but I&#8217;m almost enchanted by them. They&#8217;re slow, many are really old and usually it&#8217;s a pretty rough ride, but they also have much more character than buses and trains.

A friend and I made a mashup of Google Maps with tram stops once, and using timetable information, we plotted approximated locations of trams along a line. The trams even moved along the line, although it wasn&#8217;t really realistic, it was fun to watch. I spoke to Yarra Trams about what we had done, and I was invited to come and see the Operations Centre in South Melbourne, which was quite interesting. They offered me a job working with their development team on some .NET/Windows web services stuff (which turned out to be the TramTracker service), but I just couldn&#8217;t leave [VPAC](http://www.vpac.org) at the time.

<div id="attachment_402" style="width: 210px" class="wp-caption alignnone">
  <a href="http://www.andybotting.com/wordpress/wp-content/uploads/tramhunter-stopdetails.png"><img class="size-medium wp-image-402" title="Tram Hunter Stop Details" src="http://www.andybotting.com/wordpress/wp-content/uploads/tramhunter-stopdetails-200x300.png" alt="Tram Hunter Stop Details" width="200" height="300" srcset="http://www.andybotting.com/wp-content/uploads/tramhunter-stopdetails-200x300.png 200w, http://www.andybotting.com/wp-content/uploads/tramhunter-stopdetails.png 320w" sizes="(max-width: 200px) 100vw, 200px" /></a>
  
  <p class="wp-caption-text">
    Real Time Departures
  </p>
</div>

<div id="attachment_401" style="width: 210px" class="wp-caption alignnone">
  <a href="http://www.andybotting.com/wordpress/wp-content/uploads/tramhunter-menu.png"><img class="size-medium wp-image-401" title="Tram Hunter Menu" src="http://www.andybotting.com/wordpress/wp-content/uploads/tramhunter-menu-200x300.png" alt="Tram Hunter Menu" width="200" height="300" srcset="http://www.andybotting.com/wp-content/uploads/tramhunter-menu-200x300.png 200w, http://www.andybotting.com/wp-content/uploads/tramhunter-menu.png 320w" sizes="(max-width: 200px) 100vw, 200px" /></a>
  
  <p class="wp-caption-text">
    Application Menu
  </p>
</div>

So once Android was finally released, I bought their ADP1 development phone as quickly as I could. It cost a fortune, as the Australian dollar was quite weak at the time, but was pretty exciting. The idea of an Open Source phone to finally kick start some innovation in the mobile industry really appealed to me. I started messing with the Android API soon after.

I started working on Tram Hunter but got a bit stuck. I ended up shelving the project because I couldn&#8217;t figure out a problem I had, and moved on to other projects. It wasn&#8217;t until later (and I had moved to _London_), I was speaking to a friend of mine who was doing some Android development and he offered to help with the project. I proceeded to clean up the code, so it was in a compile-able state for someone else to look at. Somehow I managed to solve the issue and get something working. Everything seemed to just fall into place, and I had a working first version done.

I came across another project by accident by a couple of guys looking to do the same thing. I emailed them, and suddenly we had three developers and another joined soon after. I opened a [Google Code project](http://tramhunter.googlecode.com), put all our stuff into SVN and released version 0.1 to the Android Market. I later started a [Google Groups mailing list](http://groups.google.com/group/tramhunter) for the project also.

The Tram Tracker iPhone application is slow and takes many taps to get to the information you want. Their interface has been designed to mimic the information screens at tram stops which is a nice idea, but actually provides an irritating user experience.

In comparison, the goal of Tram Hunter is to bring as many useful features as we can, without compromising the interface. I wanted to provide users the ability to get the information they want, with the least amount of clicks.

By using all the standard Android UI features, we gain a lot without needing to write a lot of code. Google Maps, location information by GPS, Network and Wifi, UI and search are all provided in the API so we don&#8217;t need to write this stuff ourselves. It also means it&#8217;s fast and simple.

Since the first version, we&#8217;ve introduced a few new features and have been fixing bugs. We&#8217;re on version 0.5 right now, and there&#8217;ll be a new one just around the corner.

The latest stats from the Android Market show <span><strong>4325</strong></span> total installs, with <span><strong>3128</strong></span> active installs (<span>72%</span>). Not bad considering the slow uptake of Android in Melbourne, and the limited number of tram users in Melbourne.

In version 0.4 of Tram Hunter, I introduced some code which (when only specifically enabled by the user) would send some usage information to a Google App Engine site I have set up. Tram Hunter will provide information about the user&#8217;s handset and Tram Hunter settings (e.g. What device is being used, what version of Tram Hunter is installed, which mobile network are we using, etc). It will also send information about which stops a user is requesting, and their location when they make the request.

[<img class="size-medium wp-image-403" title="Melbourne Heat Map" src="http://www.andybotting.com/wordpress/wp-content/uploads/screenshot-test-mozilla-firefox-300x234.png" alt="Melbourne Heat Map" width="300" height="234" srcset="http://www.andybotting.com/wp-content/uploads/screenshot-test-mozilla-firefox-300x234.png 300w, http://www.andybotting.com/wp-content/uploads/screenshot-test-mozilla-firefox.png 997w" sizes="(max-width: 300px) 100vw, 300px" />](http://tramhunter.andybotting.com/stats/map/)

I&#8217;m currently in the process of generating heat maps, to indicate the location of Tram Hunter requests. Unfortunately, the code isn&#8217;t finished so I can&#8217;t release them out in the open yet. I have some Google App Engine bit to sort out first, but I&#8217;ll be releasing all the interesting statistics to the Android community.

**UPDATE:** The [heat map](http://tramhunter.andybotting.com/stats/map/) is now running well on App Engine. The totally new [Tram Hunter web site](http://tramhunter.andybotting.com/) is now up and running with lots of [cool graphs](http://tramhunter.andybotting.com/stats/) and stuf.

## What&#8217;s next?

For Tram Hunter, I&#8217;m still taking feature requests and bug reports at our [issue tracker](http://code.google.com/p/tramhunter/issues/list), but I think development of this is starting to slow down.

I have been throwing around the possibility of porting it to Maemo/Meego to support the Nokia N900 (although something similar [already exists](http://blogs.gnome.org/danni/2009/12/20/melbourne-tram-tracker-for-the-n900/)) and possibly to BlackBerry devices. BlackBerry also uses Java, so it should be quite easy to reuse a lot of code.

I&#8217;m also looking into developing another application for timetable information. I have had many requests for an app for buses and trains, so I&#8217;m looking to leaveraging some Google Transit code and proving users with an ability to download specially formatted timetables to their handset and use many of the features of Tram Hunter, but in an offline fashion. The idea is that it&#8217;ll be generic enough that it can be used for any type of timetable information for anywhere in the world, as long as people are willing to help port the timetable information.