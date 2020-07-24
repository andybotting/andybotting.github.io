---
id: 1195
title: P2127 code on a Focus XR5/Focus ST
date: 2014-03-28T12:19:19+00:00
author: Andy Botting
layout: post
guid: http://www.andybotting.com/?p=1195
permalink: /p2127-code-on-a-focus-xr5focus-st
categories:
  - Personal
---
I had an issue with my 2007 Ford Focus XR5 (aka Focus ST) recently.

I started getting a &#8216;**Steering Assist Failure**&#8216; message appear occasionally when starting my car. Usually I could just turn if off, leave it for a little while then start again and it would be OK, and the car would be behave normally.

Shortly after I got an &#8216;**Engine Systems Fault**&#8216; message and the car entered &#8216;**Low Acceleration Mode**&#8216; to protect itself. Using my OBD-II adapter and the &#8216;Torque&#8217; Android app, I found the specific error to be:

<p style="padding-left: 30px;">
  P2127 &#8211; Throttle/Pedal Position Sensor/Switch &#8216;E&#8217; Circuit Low
</p>

Using the magic powers of Google, I found [this](http://www.fordstownerssa.co.za/forums/viewtopic.php?f=20&t=25953):

<p style="padding-left: 30px;">
  &#8220;Finally the P2127 error code was sorted.
</p>

<p style="padding-left: 30px;">
  When the car is started in the morning the voltage drops below 9v.
</p>

<p style="padding-left: 30px;">
  9v is the threshold voltage for the all the ECU sensors, first sensor on my car that then schemes there&#8217;s k@k in the land is the throttle position sensor.&#8221;
</p>

Using my very cheap multimeter, I tested the load across the battery. When I turned the key, sure enough, the voltage dropped from 12.43V to 8.3V, sending the throttle position sensor into an error state. Testing the same thing on Bek&#8217;s car showed it dropped to about 10.5V which is much healthier.

Once I installed a new battery, everything worked perfectly.

Hopefully this might help someone else, although I&#8217;m sure a different type of car would exhibit different symptoms.