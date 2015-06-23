/**
* This Javascript package creates Photoshop-like guides and rulers interface on a web page.
* Guides are created by click-and-dragging corresponding horizontal or vertical ruler.
* Guide positions could be saved in a local storage and opened later (on a page location basis)
* It is possible to open/save created guides as grids
* (Note: grids will be saved on a page location basis, so it's not possible to use the same grids in another browser window/tab).
* Rulers can be unlocked, so that one of the rulers will scroll along the page and the other will be always visible.
* Detailed info mode is available, which shows position and size of regions created by the guides.
*
* Following hotkeys are available:
*
* Toggle rulers - Ctrl+Alt+R
* Toggle guides - Ctrl+Alt+G
* Toggle rulers and guides - Ctrl+Alt+A
* Clear all guides - Ctrl+Alt+D
* Save grid dialog - Ctrl+Alt+S
* Open grid dialog - Ctrl+Alt+P
* Lock/unlock rulers - Ctrl+Alt+L
* Toggle detailed info - Ctrl+Alt+I
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
var RulersGuides = function (evt, dragdrop, options) {
    'use strict';

    options = (options != undefined) ? options : {
        container:  document.body,
        unitLabel:  'px'
    };

    var doc         = document.documentElement,
        body        = options.container,
        wrapper     = null,
        lockHandler = null,
        locked      = 1,
        hRuler      = null,
        vRuler      = null,
        menu        = null,
        dialogs     = [],
        openGridDialog = null,
        mode        = 2,
        guides      = {},
        guidesCnt   = 0,
        gUid        = '',
        rulerStatus = 1,
        guideStatus = 1,
        hBoundStart = 0,
        hBoundStop  = 0,
        vBoundStart = 0,
        vBoundStop  = 0,
        gridList    = null,
        gridListLen = 0,
        menuBtn     = null,
        gInfoBlockWrapper = null,
        detailsStatus = 0,
        resizeTimer = null,
        unitLabel   = (options.unitLabel != undefined) ? options.unitLabel : 'px',
        Ruler       = function (type, size) {
            var ruler       = document.createElement('div'),
                i           = 0,
                span        = document.createElement('span'),
                label       = null,
                labelTxt    = null,
                spanFrag    = document.createDocumentFragment(),
                cnt         = Math.floor(size / 2);

            ruler.className = 'ruler ' + type + ' unselectable';

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
        getWindowSize = function () {
            var w = Math.min(
                    body.scrollWidth,
                    body.offsetWidth
                ),
                h = Math.min(
                    body.scrollHeight,
                    body.offsetHeight
                );

            return [w, h];
        },
        getScrollPos = function () {
            var t = Math.max(doc.scrollTop, body.scrollTop),
                l = Math.max(doc.scrollLeft, body.scrollLeft);

            return [t, l];
        },
        getScrollSize = function () {
            var w = Math.max(doc.scrollWidth, body.scrollWidth),
                h = Math.max(doc.scrollHeight, body.scrollHeight);

            return [w, h];
        },
        closeAllDialogs = function () {
            var i = 0;

            for (i; i < dialogs.length; i = i + 1) {
                dialogs[i].close();
            }
        },
        removeInboundGuide = function (guide, gUid) {
            var scrollPos = getScrollPos();

            if (
                rulerStatus === 1 && guideStatus === 1 && (
                    (guide.className === 'guide h draggable' && guide.offsetTop < hBound + scrollPos[0]) ||
                    (guide.className === 'guide v draggable' && guide.offsetLeft < vBound + scrollPos[1])
                )
            ) {
                wrapper.removeChild(guide);
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

            if (guideStatus === 1) {
                wrapper.style.display = 'block';
            }
        },
        toggleRulers = function () {
            rulerStatus = 1 - rulerStatus;

            if (rulerStatus === 1) {
                vRuler.style.display = 'block';
                hRuler.style.display = 'block';
                wrapper.style.display = 'block';
                removeInboundGuides();
            } else {
                vRuler.style.display = 'none';
                hRuler.style.display = 'none';
            }
        },
        removeGrid = function (gridName) {
            if (gridList[gridName] !== undefined) {
                delete gridList[gridName];
                window.localStorage.setItem('RulersGuides', JSON.stringify(gridList));
                gridListLen = gridListLen - 1;
            }
        },
        deleteGuides = function () {
            var i;

            if (guidesCnt > 0) {
                for (i in guides) {
                    if (guides.hasOwnProperty(i)) {
                        wrapper.removeChild(guides[i]);
                        delete guides[i];
                        guidesCnt = guidesCnt - 1;
                    }
                }

                gInfoBlockWrapper.style.display = 'none';
            }
        },
        renderGrid = function (gridName) {
            if (gridList[gridName] !== undefined) {
                var grid        = gridList[gridName],
                    guideId     = null,
                    guideElem   = null;

                deleteGuides();

                for (guideId in grid) {
                    if (grid.hasOwnProperty(guideId)) {
                        guideElem = document.createElement('div');
                        guideElem.id = guideId;
                        guideElem.className = grid[guideId].cssClass;
                        guideElem.style.cssText = grid[guideId].style;

                        wrapper.appendChild(guideElem);

                        guides[guideId] = guideElem;

                        guidesCnt = guidesCnt + 1;
                    }
                }
            }
        },
        OpenGridDialog = function () {
            var dialog = null,
                self = this,
                select = null,
                renderSelect = function (insertOrUpdate) {
                    var gridName,
                        options = '',
                        i;

                    gridListLen = 0;

                    if (window.localStorage) {
                        gridList = JSON.parse(window.localStorage.getItem('RulersGuides'));

                        for (i in gridList) {
                            if (gridList.hasOwnProperty(i)) {
                                gridListLen = gridListLen + 1;
                            }
                        }
                    }

                    if (insertOrUpdate === 0) {
                        select = document.createElement('select');
                        select.id = 'grid-list';
                    }

                    if (gridListLen > 0) {
                        for (gridName in gridList) {
                            if (gridList.hasOwnProperty(gridName)) {
                                options += '<option>' + gridName + '</option>';
                            }
                        }

                        select.innerHTML = options;
                    }

                    return select;
                };

            this.render = function () {
                if (dialog === null) {
                    dialog = document.createElement('div');
                    select = renderSelect(0);

                    var text = document.createTextNode(''),
                        titleBar = dialog.cloneNode(false),
                        dialogWrapper = dialog.cloneNode(false),
                        okBtn = document.createElement('button'),
                        cancelBtn = okBtn.cloneNode(false),
                        delBtn = okBtn.cloneNode(false),
                        titleBarTxt = text.cloneNode(false),
                        okBtnTxt = text.cloneNode(false),
                        cancelBtnTxt = text.cloneNode(false),
                        delBtnTxt = text.cloneNode(false);

                    titleBarTxt.nodeValue = 'Open grid';
                    okBtnTxt.nodeValue = 'OK';
                    cancelBtnTxt.nodeValue = 'Cancel';
                    delBtnTxt.nodeValue = 'Delete';

                    dialog.className = 'dialog open-dialog';
                    titleBar.className = 'title-bar';
                    dialogWrapper.className = 'wrapper';

                    okBtn.className = 'ok-btn';
                    cancelBtn.className = 'cancel-btn';
                    delBtn.className = 'del-btn';

                    titleBar.appendChild(titleBarTxt);
                    okBtn.appendChild(okBtnTxt);
                    cancelBtn.appendChild(cancelBtnTxt);
                    delBtn.appendChild(delBtnTxt);

                    dialogWrapper.appendChild(select);
                    dialogWrapper.appendChild(delBtn);
                    dialogWrapper.appendChild(okBtn);
                    dialogWrapper.appendChild(cancelBtn);

                    dialog.appendChild(titleBar);
                    dialog.appendChild(dialogWrapper);

                    body.appendChild(dialog);

                    evt.attach('click', delBtn, function () {
                        if (window.confirm('Are you sure ?')) {
                            if (select.options.length > 0) {
                                removeGrid(select.options[select.selectedIndex].value);

                                select.removeChild(
                                    select.options[select.selectedIndex]
                                );
                            }

                            if (select.options.length === 0) {
                                self.close();
                            }
                        }
                    });

                    evt.attach('click', okBtn, function () {
                        renderGrid(select.value);
                        self.close();
                    });

                    evt.attach('click', cancelBtn, function () {
                        self.close();
                    });
                }
            };

            this.render();

            this.open = function () {
                closeAllDialogs();

                renderSelect(1);

                if (gridListLen > 0) {
                    dialog.style.display = 'block';
                    dialog.style.left = ((doc.clientWidth - dialog.clientWidth) / 2) + 'px';
                    dialog.style.top = ((doc.clientHeight - dialog.clientHeight) / 2) + 'px';
                }
            };

            this.close = function () {
                dialog.style.display = 'none';
            };
        },
        toggleRulersLock = function () {
            if (locked === 0) {
                if (lockHandler !== null) {
                    evt.detach('scroll', window, lockHandler);
                }
            } else {
                lockHandler = evt.attach('scroll', window, function () {
                    var pos = getScrollPos(),
                        size = getScrollSize();

                    hRuler.style.top = pos[0] + 'px';
                    wrapper.style.height = size[1] + 'px';

                    vRuler.style.left = pos[1] + 'px';
                    wrapper.style.width = size[0] + 'px';
                });
            }

            locked = 1 - locked;
        },
        saveGrid = function () {
            var data = {},
                gridData = {},
                i,
                gridName = '';

            while (gridName === '' && guidesCnt > 0) {
                gridName = window.prompt('Save grid as');

                if (gridName !== '' && gridName !== false && gridName !== null && window.localStorage) {
                    for (i in guides) {
                        if (guides.hasOwnProperty(i)) {
                            gridData[i] = {
                                'cssClass' : guides[i].className,
                                'style' : guides[i].style.cssText
                            };
                        }
                    }

                    if (window.localStorage.getItem('RulersGuides') !== null) {
                        data = JSON.parse(window.localStorage.getItem('RulersGuides'));
                    }

                    data[gridName] = gridData;
                    window.localStorage.setItem('RulersGuides', JSON.stringify(data));

                    gridListLen = gridListLen + 1;
                }
            }
        },
        showDetailedInfo = function () {
            var i,
                j = 0,
                hGuides = [],
                vGuides = [],
                scrollSize = getScrollSize(),
                infoBlockWrapper = document.createElement('div'),
                infoFrag = document.createDocumentFragment(),
                infoBlock = infoBlockWrapper.cloneNode(false),
                infoBlockTxt = infoBlockWrapper.cloneNode(false),
                infoData1 = document.createTextNode(''),
                infoData2 = infoData1.cloneNode(false),
                text = '',
                br = document.createElement('br');

            for (i in guides) {
                if (guides.hasOwnProperty(i)) {
                    if (guides[i].type === 'h') {
                        hGuides.push(guides[i].y);
                    } else {
                        vGuides.push(guides[i].x);
                    }
                }
            }

            vGuides.unshift(0);
            vGuides.push(scrollSize[0]);

            hGuides.unshift(0);
            hGuides.push(scrollSize[1]);

            vGuides = vGuides.sort(function (a, b) {
                return a - b;
            });

            hGuides = hGuides.sort(function (a, b) {
                return a - b;
            });

            for (i = 0; i < hGuides.length - 1; i = i + 1) {
                j = 0;

                for (j; j < vGuides.length - 1; j = j + 1) {
                    infoBlock = infoBlock.cloneNode(false);
                    infoBlockTxt = infoBlockTxt.cloneNode(false);
                    infoData1 = infoData1.cloneNode(false);
                    infoData2 = infoData2.cloneNode(false);
                    br = br.cloneNode();

                    infoBlockWrapper.className = 'info-block-wrapper';
                    infoBlock.className = 'info-block';
                    infoBlockTxt.className = 'info-block-txt';

                    infoBlock.className += (
                        (i % 2 !== 0 && j % 2 !== 0) ||
                        (i % 2 === 0 && j % 2 === 0)
                    )
                        ? ' even'
                        : ' odd';

                    infoBlock.style.top = hGuides[i] + 'px';
                    infoBlock.style.left = vGuides[j] + 'px';
                    infoBlock.style.width = (vGuides[j + 1] - vGuides[j]) + 'px';
                    infoBlock.style.height = (hGuides[i + 1] - hGuides[i]) + 'px';

                    text = (vGuides[j + 1] - vGuides[j]) + ' x ' + (hGuides[i + 1] - hGuides[i]);

                    infoData1.nodeValue = text;

                    text = hGuides[i] + ' : ' + vGuides[j];

                    infoData2.nodeValue = text;

                    infoBlockTxt.appendChild(infoData1);
                    infoBlockTxt.appendChild(br);
                    infoBlockTxt.appendChild(infoData2);

                    infoBlock.appendChild(infoBlockTxt);

                    infoBlockTxt.style.marginTop = (i === 0) ? '31px' : '0';
                    infoBlockTxt.style.marginLeft = (j === 0) ? '42px' : '0';

                    infoFrag.appendChild(infoBlock);
                }
            }

            infoBlockWrapper.appendChild(infoFrag);

            if (detailsStatus === 1) {
                wrapper.replaceChild(infoBlockWrapper, gInfoBlockWrapper);
                gInfoBlockWrapper = infoBlockWrapper;
            } else {
                gInfoBlockWrapper.style.display = 'none';
            }
        },
        Menu = function () {
            var menuList = null,
                status   = 0,
                toggles = {},
                menuItemsList  = [{
                    'text': 'Hide rulers',
                    'hotkey': 'Ctrl + Alt + R',
                    'alias': 'rulers'
                }, {
                    'text': 'Hide guides',
                    'hotkey': 'Ctrl + Alt + G',
                    'alias': 'guides'
                }, {
                    'text': 'Hide all',
                    'hotkey': 'Ctrl + Alt + A',
                    'alias': 'all'
                }, {
                    'text': 'Unlock rulers',
                    'hotkey': 'Ctrl + Alt + L',
                    'alias': 'lock'
                }, {
                    'text': 'Clear all guides',
                    'hotkey': 'Ctrl + Alt + D',
                    'alias': 'clear'
                }, {
                    'text': 'Open grid',
                    'hotkey': 'Ctrl + Alt + O',
                    'alias': 'open'
                }, {
                    'text': 'Save grid',
                    'hotkey': 'Ctrl + Alt + G',
                    'alias': 'save'
                }, {
                    'text': 'Show detailed info',
                    'hotkey': 'Ctrl + Alt + I',
                    'alias': 'details'
                }],
                i = 0;

            this.render = function () {
                menuBtn = document.createElement('div');
                menuBtn.className = 'menu-btn unselectable';
                menuBtn.appendChild(document.createTextNode('\u250C'));

                menuList = document.createElement('ul');
                menuList.className = 'rg-menu';

                var menuItems = document.createDocumentFragment(),
                    li = document.createElement('li'),
                    liLink = document.createElement('a'),
                    liDesc = document.createElement('span'),
                    liHotKey = liDesc.cloneNode(false),
                    liDescTxt = document.createTextNode(''),
                    liHotKeyTxt = liDescTxt.cloneNode(false);

                liLink.href = 'javascript:';
                liDesc.className = 'desc';
                liHotKey.className = 'hotkey';

                for (i; i < menuItemsList.length; i = i + 1) {
                    li = li.cloneNode(false);
                    liLink = liLink.cloneNode(false);
                    liDesc = liDesc.cloneNode(false);
                    liHotKey = liHotKey.cloneNode(false);
                    liDescTxt = liDescTxt.cloneNode(false);
                    liHotKeyTxt = liHotKeyTxt.cloneNode(false);

                    liDescTxt.nodeValue = menuItemsList[i].text;
                    liHotKeyTxt.nodeValue = menuItemsList[i].hotkey;

                    liDesc.appendChild(liDescTxt);
                    liHotKey.appendChild(liHotKeyTxt);

                    liLink.appendChild(liDesc);
                    liLink.appendChild(liHotKey);

                    li.appendChild(liLink);

                    menuItems.appendChild(li);

                    toggles[menuItemsList[i].alias] = {
                        obj: liLink,
                        txt: liDescTxt
                    };
                }

                evt.attach('mousedown', toggles.rulers.obj, function () {
                    toggleRulers();
                });

                evt.attach('mousedown', toggles.guides.obj, function () {
                    toggleGuides();
                });

                evt.attach('mousedown', toggles.all.obj, function () {
                    if (rulerStatus === 1 || guideStatus === 1) {
                        rulerStatus = guideStatus = 1;
                        wrapper.style.display = 'none';
                    } else {
                        rulerStatus = guideStatus = 0;
                        wrapper.style.display = 'block';
                    }

                    toggleRulers();
                    toggleGuides();
                });

                evt.attach('mousedown', toggles.lock.obj, function () {
                    toggleRulersLock();
                });

                evt.attach('mousedown', toggles.clear.obj, function () {
                    deleteGuides();
                });

                evt.attach('mousedown', toggles.open.obj, function () {
                    openGridDialog.open();
                });

                evt.attach('mousedown', toggles.save.obj, function () {
                    saveGrid();
                });

                evt.attach('mousedown', toggles.details.obj, function () {
                    detailsStatus = 1 - detailsStatus;
                    showDetailedInfo();
                });

                menuList.appendChild(menuItems);

                body.appendChild(menuBtn);
                body.appendChild(menuList);

                evt.attach('mousedown', menuBtn, function () {
                    toggles.rulers.txt.nodeValue = (rulerStatus === 1)
                        ? 'Hide rulers'
                        : 'Show rulers';

                    if (guidesCnt > 0) {
                        toggles.guides.obj.className = '';
                        toggles.clear.obj.className = '';
                        toggles.save.obj.className = '';

                        toggles.guides.txt.nodeValue = (guideStatus === 1)
                            ? 'Hide guides'
                            : 'Show guides';
                    } else {
                        toggles.guides.obj.className = 'disabled';
                        toggles.clear.obj.className = 'disabled';
                        toggles.save.obj.className = 'disabled';
                    }

                    toggles.all.txt.nodeValue = (rulerStatus === 1 || guideStatus === 1)
                        ? 'Hide all'
                        : 'Show all';

                    toggles.lock.txt.nodeValue = (locked === 0) ? 'Lock rulers' : 'Unlock rulers';
                    toggles.details.txt.nodeValue = (detailsStatus === 0) ? 'Show detailed info' : 'Hide detailed info';
                    toggles.open.obj.className = (gridListLen > 0) ? '' : 'disabled';

                    menuList.style.display = (status === 0) ? 'inline-block' : 'none';

                    status = 1 - status;
                });
            };

            this.render();

            this.close = function () {
                if (menuList !== null) {
                    menuList.style.display = 'none';
                    status = 0;
                }
            };
        },
        prepare  = function () {
            var size = getWindowSize(),
                elements = document.getElementsByTagName('*'),
                len = elements.length,
                i = 0;

            setTimeout(function () {
                hRuler = new Ruler('h', size[0] + 10);
                vRuler = new Ruler('v', size[1] + 10);

                wrapper = document.createElement('div');
                gInfoBlockWrapper = wrapper.cloneNode(false);

                wrapper.className = 'rg-overlay';
                gInfoBlockWrapper.className = 'info-block-wrapper';

                wrapper.appendChild(hRuler);
                wrapper.appendChild(vRuler);
                wrapper.appendChild(gInfoBlockWrapper);

                body.appendChild(wrapper);

                menu = new Menu();
                openGridDialog = new OpenGridDialog();

                dialogs = [openGridDialog];
            }, 10);
        };

    prepare();

    this.status = 1;

    this.disable = function () {
        if (vRuler !== null) {
            deleteGuides();

            vRuler.style.display = 'none';
            hRuler.style.display = 'none';
            wrapper.style.display = 'none';
            menuBtn.style.display = 'none';
        }

        rulerStatus = 0;
        this.status = 0;
    };

    this.enable = function () {
        if (vRuler !== null) {
            vRuler.style.display = 'block';
            hRuler.style.display = 'block';
            wrapper.style.display = 'block';
            menuBtn.style.display = 'block';
        }

        rulerStatus = 1;
        this.status = 1;
    };

    evt.attach('mousedown', document, function (e, src) {
        var x               = e.clientX,
            y               = e.clientY,
            xOffset         = Math.abs(vRuler.parentElement.offsetLeft) - 2,
            yOffset         = Math.abs(vRuler.parentElement.offsetTop) - 2,
            guide           = null,
            guideInfo       = null,
            guideInfoText   = null,
            scrollPos       = getScrollPos();

        if (src.className.indexOf('menu-btn') === -1) {
            menu.close();
        }

        if (vBoundStart === 0) {
            vBoundStart = vRuler.parentElement.offsetParent.offsetLeft + vRuler.parentElement.offsetLeft;
            vBoundStop = vBoundStart + vRuler.offsetWidth;
            hBoundStart = hRuler.parentElement.offsetParent.offsetTop + hRuler.parentElement.offsetTop;
            hBoundStop = hBoundStart + hRuler.offsetHeight;
        }

        if (((x > vBoundStart && x < vBoundStop && y > hBoundStop) ||
            (y > hBoundStart && y < hBoundStop && x > vBoundStop)) && rulerStatus === 1) {

            guide = document.createElement('div');
            guideInfo = guide.cloneNode(false);
            guideInfoText = document.createTextNode('');

            gUid = 'guide-' + guidesCnt;

            guideInfo.className = 'info';

            guideInfo.appendChild(guideInfoText);
            guide.appendChild(guideInfo);

            if (x > vBoundStop && y < hBoundStop) {
                guide.className = 'guide h draggable';
                guide.style.top = yOffset + 'px';
                guide.type = 'h';
                mode = 2;
            } else if (y > hBoundStop && x < vBoundStop) {
                guide.className = 'guide v draggable';
                guide.style.left = xOffset + 'px';
                guide.type = 'v';
                mode = 1;
            }

            guide.id = gUid;
            guide.info = guideInfo;
            guide.text = guideInfoText;
            guide.x    = 0;
            guide.y    = 0;

            guides[gUid] = guide;

            wrapper.appendChild(guide);

            dragdrop.set(guide, {
                mode: mode,
                onstart: function (elem) {
                    elem.text.nodeValue = 0 + unitLabel;

                    if (elem.over !== undefined) {
                        evt.detach('mouseover', elem, elem.over);
                        evt.detach('mouseout', elem, elem.out);
                    }
                },
                onmove: function (elem) {
                    var text, pos, negativeRule,
                        dims    = [],
                        len     = 0,
                        i       = 0;

                    pos = (elem.mode === 1) ? elem.style.left : elem.style.top;
                    pos = parseInt(pos, 10);
                    negativeRule = (elem.mode === 1) ? pos - xOffset < 0 : pos - yOffset < 0;

                    if (!negativeRule) {
                        elem.style.display = 'block';
                        text = pos = (elem.mode === 1) ? (pos - xOffset) + unitLabel : (pos - yOffset) + unitLabel;

                        if (elem.mode === 1) {
                            elem.style.left = pos + 'px';
                            elem.x = pos;
                        } else {
                            elem.style.top = pos + 'px';
                            elem.y = pos;
                        }

                        elem.text.nodeValue = text;
                    } else {
                        elem.style.display = 'none';
                    }
                },
                onstop: function (elem) {
                    elem.over = evt.attach('mouseover', elem, function (e, src) {
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

        if (detailsStatus === 1) {
            showDetailedInfo();
        }
    });

    evt.attach('keyup', document, function (e) {
        if (e.ctrlKey === true && e.altKey === true) {
            switch (e.keyCode) {
            case 83:
                saveGrid();
                break;
            case 82:
                toggleRulers();
                break;
            case 79:
                openGridDialog.open();
                break;
            case 76:
                toggleRulersLock();
                break;
            case 73:
                detailsStatus = 1 - detailsStatus;
                showDetailedInfo();
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
                    wrapper.style.display = 'none';
                } else {
                    rulerStatus = guideStatus = 0;
                    wrapper.style.display = 'block';
                }

                toggleRulers();
                toggleGuides();

                break;
            }
        }
    });

    evt.attach('resize', window, function () {
        var size = getWindowSize();

        wrapper.style.width = size[0] + 'px';
        wrapper.style.height = size[1] + 'px';

        if (resizeTimer !== null) {
            window.clearTimeout(resizeTimer);
        }
    });
};