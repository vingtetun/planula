## Planula

Planula is an HTML based web browser UI built on top of Gecko.

## Goals

After an explanatory phase, the goal is to pave the way for a migration of the Firefox product to rely on web technologies, instead of XUL/XPCOM.

The migration strategy rely on incremental changes, trying to modularize the Firefox codebase based on the necessary needs that has been discovered with Planula.

At the same time Planula tries to offer a strict separation of concerns between the various parts that composite a browser UI in order to make contributions simpler, and put the focus on reducing the time it takes to deliver changes to users.

## Concepts

 - Load the core navigation interface (the chrome) from https
 - Use WebExtensions to implement features and extend the chrome
    - Migrate those extensions back into Firefox (e.g: Download Manager) 
 - Reuse as much as possible from mozilla-central (e.g: about:home, about:preferences, devtools, addon manager, gecko)
 - Focus on A/B testing with small and distinct incremental updates
    - Use Service Workers for the chrome
    - Use Web Extensions update for features

## Prototype

In order to validate the concept, a small prototype has been set up.

It is very unstable and/or many features are in a half baked shape but it let us see what are the missing pieces,
what will be the challenges, and does the concept simply works.

Currently performances are not great. This is vasly due to Web Extensions support and the highly scoped nature of Planula.
Digging a little bit it does seems most of those can be fixed. It just needs times.

#### Features
 - Multiple windows with tabs
 - Basic Awesome bar
 - Basic tab session
 - Basic popup support
 - about: pages (about:addons, about:home, about:preferences[for gecko/platform prefs])
 - WebExtensions support (core + toolkit + incomplete tabs/browserAction API)
 - Devtools
 - De-facto support e10s
 - Able to run mochitest-plain test suite

#### Giving it a try

Try build, patch queue gecko.
Screencast?

#### Installation
```sh
$ git clone http://github.com/vingtetun/planula.git planula
```

 Currently Planula needs a couple of small patches to run on top of Gecko (e.g allow about: pages to be loaded into a mozbrowser iframe), but many parts should work by default on top of Firefox Nightly.
 
 **TODO** > upload this set of patches to the repo

The project comes with its own built-in httpd daemon serving resources on port 8081.
You need to specify the absolute path of the directory containing planula as an ENV variable called MOZ_BASE_DIR.

 **TODO** > Create a shell script to start

```sh
$ MOZ_BASE_DIR=/path/to/planula firefox -profile planula/config/profile
```

## Technology

Planula use a number of technologies to make it works properly:
* ["The Web"] - HTML/JS/CSS are used to craft the build the interface
* ["The internet"] - The code chrome (toolbar, tab strip, tabs) is loaded on https
* [Browser API] - aka mozbrowser API, to load web pages from HTML
* [Service Workers] - Offline support for the chrome
* [Support Web Extensions] - User Interface features are implemented as Web extensions
* [Implement Web Extensions] - Support existing addons, and allows to abstract all browser related APIs
* [BroadcastChannel] - Cross-contexts / Cross-processes communication
* [System XMLHttpRequest] - To support open search. Will likely be replaced by a chrome.omnibox.
* [Shared Worker] - Cross context shared libraries
* [Bootstrap Extensions] - Allows to make the Web Extensions API to work and also workaround some Gecko limitations until they are fixed

## Todos
- uses WebExtensions to implement browser features: bookmarks, downloads, opensearch
- add support for pdf.js/shumway
- add Support for Firefox Hello
- add support for Firefox Sync
- add support for Private Windows.
- add support for Session Restore
- and many many things...

## FAQ

##### Why a new project instead of starting directly from the Firefox codebase ?
There are many different options when it comes to change the underlying set of technologies used by Firefox.
But it is hard to envision all the pros and cons of moving from XUL/XPCOM to something else (native, HTML, etc...).
Also it seems extremelly hard to try to convert all of Firefox in once, whatever the choosen option is.
And making something modular, or context agnostic, when you have only one consumer is often tricky.

Because of those reasons, it seems reasonable to create a small shell, acting as a new consumer for some specific browser chrome needs.
**some specific browser chrome needs??**
Planula will then try to reuse as much as possible from Firefox by cleaning some pieces of code that relies on some browser.xul specificities, and when possible, upstream those changes.
Planula also makes the assertions that some of the chrome will always be written using Web Technologies, such as UA in-content pages (e.g about:home), or chrome features (e.g Download Manager). **no, devtools and about:addons are using xul, not an issue!**
We believe that working on isolating those pieces, to reuse them in our small shell will not be lost work, whatever technologies for the front-end is choosen in the future.
We also believe that making those consumers specifities agnostic may make it easier to migrate to Servo one day.
Lastly, there are some others initiatives at Mozilla to explore HTML based UI for the browsers, such as browser.html and Hope.
By implementing our own HTML shell, it will be easier for those to s/reuse some Firefox parts./integrate with gecko/.

#### What are the current need of the project ?
Like many projects: time, resources and supports.

The 2 current maintainers are not officialy dedicated to this project, and even if they were, 2 persons is not enough. Futhermore, because of the will to reuse existing parts and make them independent adding new people and finding them specific tasks is easy and will be highly beneficial to the project.
Also, with Firefox OS and most of its codebase beeing shifted to Tier-3, we would like to ensure some parts stay under maintenance and under the radar of the platform. Mostly the Browser API so far.
We need support if we start providing patches against gecko. These patches would mostly be about:
 * supporting <html:iframe mozbrowser> rather than <xul:browser>,
 * stop assuming the top level browser is browser.xul and access its Javascript internal (like gBrowser) and instead use WebExtension APIs to interact with the browser,
 * maintain and enhance mozbrowser API.

