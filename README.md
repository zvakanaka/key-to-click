# Key to Click Firefox Addon
Example config for [https://apod.nasa.gov](https://apod.nasa.gov):
```
{
  "ArrowLeft": "hr + a",
  "ArrowRight": "center a[href^=\"ap\"]:last-of-type"
}
```
Find `event.key` values here: [https://keycode.info/](https://keycode.info/)

## Developing
https://extensionworkshop.com/documentation/develop/debugging/#debugging_popups

`web-ext run --firefox=/Applications/Firefox\ Developer\ Edition.app/Contents/MacOS/firefox --firefox-profile=Dev`  

Outdated but slightly useful: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Firefox_workflow_overview

## TODO
- [ ] Advanced config - ability to not ignore certain keys while in input/textarea/select
