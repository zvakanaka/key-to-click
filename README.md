# Key to Click Firefox Addon (and Chrome Extension)
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

### [Icons](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/icons)
```sh
convert ./icons/icon-fullsize.png -resize 48x48^ -background none -gravity center -extent 48x48 icons/icon.png
convert ./icons/icon-fullsize.png -resize 96x96^ -background none -gravity center -extent 96x96 icons/icon@2x.png
```

## TODO
- [ ] Advanced config - ability to not ignore certain keys while in input/textarea/select

## Sources
Icon from https://openmoji.org/library/emoji-1F5B1/
