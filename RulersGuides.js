/**
* This Javascript package creates Photoshop-like guides and rulers interface on a web page.
* Guides are created by click-and-dragging corresponding horizontal or vertical ruler.
* Following hotkeys are available:
*
* Toggle rulers - Ctrl+Alt+R
* Toggle guides - Ctrl+Alt+G
* Toggle rulers and guides - Ctrl+Alt+A
* Clear all guides - Ctrl+Alt+D
*
* Look-and-feel can be adjusted using CSS.
*
* RulersGuides.js is available as a bookmarklet, please see bookmarklet.js file
* provided with the package
*
* RulersGuides.js requires Event.js and Dragdrop.js packages, which can be acquired at the following links:
*
* Event.js
*
* Github - https://github.com/mark-rolich/Event.js
* JS Classes - http://www.jsclasses.org/package/212-JavaScript-Handle-events-in-a-browser-independent-manner.html
*
* Dragdrop.js
*
* Github - https://github.com/mark-rolich/Dragdrop.js
* JS Classes - http://www.jsclasses.org/package/215-JavaScript-Handle-drag-and-drop-events-of-page-elements.html
*
* @author Mark Rolich <mark.rolich@gmail.com>
*/
var RulersGuides = function (evt, dragdrop) {
    'use strict';

    var doc         = document.documentElement,
        body        = document.body,
        gWidth      = 0,
        gHeight     = 0,
        Ruler       = function (type, size) {
            var i           = 0,
                ruler       = document.createElement('div'),
                span        = document.createElement('span'),
                label       = null,
                labelTxt    = null,
                spanFrag    = document.createDocumentFragment(),
                cnt         = Math.floor(size / 2);

            ruler.className = 'ruler ' + type;

            if (type === 'h') {
                ruler.style.width = size + 'px';
            } else {
                ruler.style.height = size + 'px';
            }

            for (i; i < cnt; i = i + 1) {
                span = span.cloneNode(false);

                if (i % 25 === 0) {
                    span.className = 'milestone';

                    if (i > 0) {
                        label = span.cloneNode(false);
                        label.className = 'label';

                        if (i < 50) {
                            label.className += ' l10';
                        } else if (i >= 50 && i < 500) {
                            label.className += ' l100';
                        } else if (i >= 500) {
                            label.className += ' l1000';
                        }

                        labelTxt = document.createTextNode(i * 2);
                        label.appendChild(labelTxt);
                        span.appendChild(label);
                    }

                    span.className = 'milestone';
                } else if (i % 5 === 0) {
                    span.className = 'major';
                } else {
                    span.className = '';
                    span.removeAttribute('class');
                }

                spanFrag.appendChild(span);
            }

            ruler.appendChild(spanFrag);

            return ruler;
        },
        hRuler      = null,
        vRuler      = null,
        mode        = 2,
        guides      = {},
        guidesCnt   = 0,
        gUid        = '',
        rulerStatus = 1,
        guideStatus = 1,
        hBound      = 0,
        vBound      = 0,
        removeInboundGuide = function (guide, gUid) {
            if (
                rulerStatus === 1 && guideStatus === 1 && (
                    (guide.className === 'guide h draggable' && guide.offsetTop < hBound) ||
                    (guide.className === 'guide v draggable' && guide.offsetLeft < vBound)
                )
            ) {
                document.body.removeChild(guide);
                delete guides[gUid];
                guidesCnt = guidesCnt - 1;
            }
        },
        removeInboundGuides = function () {
            var i;

            for (i in guides) {
                if (guides.hasOwnProperty(i)) {
                    removeInboundGuide(guides[i], i);
                }
            }
        },
        toggleGuides = function () {
            var i;

            guideStatus = 1 - guideStatus;

            for (i in guides) {
                if (guides.hasOwnProperty(i)) {
                    guides[i].style.display = (guideStatus === 1)
                        ? 'block'
                        : 'none';
                }
            }
        },
        toggleRulers = function () {
            rulerStatus = 1 - rulerStatus;

            if (rulerStatus === 1) {
                vRuler.style.display = 'block';
                hRuler.style.display = 'block';
                removeInboundGuides();
            } else {
                vRuler.style.display = 'none';
                hRuler.style.display = 'none';
            }
        },
        cssText     = 'html,body{margin:0;padding:0}.guide{position:absolute;top:0;left:0;z-index:9999;font-size:0}.guide.v{width:1px;border-right:solid 1px #00f;cursor:col-resize}.guide.h{height:1px;border-bottom:solid 1px #00f;cursor:row-resize}.info{width:50px;height:25px;line-height:25px;text-align:center;position:relative;font-size:13px;background-color:#eee;border:solid 1px #ccc;color:#000}.guide.v .info{left:2px}.guide.h .info{top:2px}.ruler{-moz-user-select:-moz-none;-khtml-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select:none;background-color:#ccc;position:absolute;top:0;left:0;z-index:9998}.ruler .label{font:12px Arial;color:#000}.ruler,.ruler span{font-size:0}.ruler.h{left:-1px;padding-top:14px;border-bottom:solid 1px #000}.ruler.v{top:-1px;padding-left:16px;width:25px;border-right:solid 1px #000}.ruler.h span{border-left:solid 1px #999;height:9px;width:1px;vertical-align:bottom;display:inline-block;*display:inline;zoom:1}.ruler.v span{display:block;margin-left:auto;margin-right:0;border-top:solid 1px #999;width:9px;height:1px}.ruler.v span.major{border-top:solid 1px #000;width:13px}.ruler.v span.milestone{position:relative;border-top:solid 1px #000;width:17px}.ruler.v span.label{border:0;font-size:9px;position:absolute;text-align:center;width:9px}.ruler.h span.major{border-left:solid 1px #000;height:13px}.ruler.h span.milestone{position:relative;border-left:solid 1px #000;height:17px}.ruler.h span.label{border:0;font-size:9px;position:absolute;text-align:center;top:-14px;width:9px}.ruler.h .l10{left:-5px}.ruler.h .l100{left:-7px}.ruler.h .l1000{left:-10px}.ruler.v .l10,.ruler.v .l100,.ruler.v .l1000{top:-7px}.ruler.v .l10{left:-12px}.ruler.v .l100{left:-17px}.ruler.v .l1000{left:-23px}',
        prepare     = function () {
            var style = document.createElement('style');

            style.innerHTML = cssText;
            document.body.appendChild(style);

            gWidth = document.documentElement.clientWidth;
            gHeight = Math.max(body.scrollHeight, body.offsetHeight, doc.clientHeight, doc.scrollHeight, doc.offsetHeight);

            hRuler      = body.appendChild(new Ruler('h', gWidth));
            vRuler      = body.appendChild(new Ruler('v', gHeight));
        },
        deleteGuides = function () {
            var i;

            if (guidesCnt > 0) {
                for (i in guides) {
                    if (guides.hasOwnProperty(i)) {
                        document.body.removeChild(guides[i]);
                        delete guides[i];
                        guidesCnt = guidesCnt - 1;
                    }
                }
            }
        };

    prepare();

    this.status = 1;

    this.disable = function () {
        deleteGuides();

        vRuler.style.display = 'none';
        hRuler.style.display = 'none';

        rulerStatus = 0;
        this.status = 0;
    };

    this.enable = function () {
        vRuler.style.display = 'block';
        hRuler.style.display = 'block';

        rulerStatus = 1;
        this.status = 1;
    };

    evt.attach('mousedown', document, function (e) {
        if (vBound === 0) {
            vBound = vRuler.offsetWidth;
            hBound = hRuler.offsetHeight;
        }

        if (
            (
                (e.clientX > vBound && e.clientY < hBound) ||
                (e.clientY > hBound && e.clientX < vBound)
            ) && rulerStatus === 1
        ) {
            var guide = document.createElement('div'),
                guideInfo = guide.cloneNode(false),
                guideInfoText = document.createTextNode('');

            gUid = 'guide-' + guidesCnt;

            guideInfo.className = 'info';

            guideInfo.appendChild(guideInfoText);
            guide.appendChild(guideInfo);

            if (e.clientX > vBound && e.clientY < hBound) {
                guide.className = 'guide h draggable';
                guide.style.top = e.clientY + 'px';
                guide.style.width = gWidth + 'px';
                guideInfo.style.left = (e.clientX + 10) + 'px';

                mode = 2;
            } else if (e.clientY > hBound && e.clientX < vBound) {
                guide.className = 'guide v draggable';
                guide.style.left = e.clientX + 'px';
                guide.style.height = gHeight + 'px';
                guideInfo.style.top = (e.clientY - 35) + 'px';

                mode = 1;
            }

            guide.id = gUid;
            guide.info = guideInfo;
            guide.text = guideInfoText;

            guides[gUid] = guide;

            document.body.appendChild(guide);

            dragdrop.set(guide, {
                mode: mode,
                onstart: function (elem) {
                    var text = (elem.mode === 1)
                            ? parseInt(elem.style.left, 10) + 2
                            : parseInt(elem.style.top, 10) + 2;

                    elem.text.nodeValue = text;

                    if (elem.over !== undefined) {
                        evt.detach('mouseover', elem, elem.over);
                        evt.detach('mouseout', elem, elem.out);
                    }
                },
                onmove: function (elem) {
                    var text = (elem.mode === 1)
                            ? parseInt(elem.style.left, 10) + 2
                            : parseInt(elem.style.top, 10) + 2;

                    elem.text.nodeValue = text;
                },
                onstop: function (elem) {
                    elem.over = evt.attach('mouseover', elem, function (e, src) {
                        if (src.className === 'guide v draggable') {
                            elem.info.style.top = (e.clientY - 35) + 'px';
                        } else if (src.className === 'guide h draggable') {
                            elem.info.style.left = (e.clientX + 10) + 'px';
                        }

                        elem.info.style.display = 'block';
                    });

                    elem.out = evt.attach('mouseout', elem, function () {
                        elem.info.style.display = 'none';
                    });
                }
            });

            dragdrop.start(e, guide);

            guidesCnt = guidesCnt + 1;
        }
    });

    evt.attach('mouseup', document, function (e, src) {
        removeInboundGuide(src, src.id);
    });

    evt.attach('keyup', document, function (e) {
        if (e.ctrlKey === true && e.altKey === true) {
            switch (e.keyCode) {
            case 82:
                toggleRulers();
                break;
            case 71:
                toggleGuides();
                break;
            case 68:
                deleteGuides();
                break;
            case 65:
                if (rulerStatus === 1 || guideStatus === 1) {
                    rulerStatus = guideStatus = 1;
                } else {
                    rulerStatus = guideStatus = 0;
                }

                toggleRulers();
                toggleGuides();
                break;
            }
        }
    });
};