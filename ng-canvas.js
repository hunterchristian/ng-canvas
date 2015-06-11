/**
 * Created by hunterhodnett on 5/4/15.
 */
(function ( factory ) {

    var angular = window.angular;
    var jQuery  = require('../../../bower_components/jquery/dist/jquery.min.js');
    factory(angular, jQuery);

}( function( angular, $, undefined ) {
    "use strict";

    angular
        .module('ng-canvas', [])
        .factory('canvas', function(lodash) {

            // Public functions
            /**
             * Returns the top and left offset of a jquery object within a canvas.
             * @param canvasObj - the canvas containing the object
             * @param object - the object within the canvas
             * @returns {{top: number, left: number}} - the position of the object within the canvas
             */
            function getPositionWithinCanvas(canvasObj, object) {
                return {
                    top: object.offset().top - canvasObj.offset().top,
                    left: object.offset().left - canvasObj.offset().left
                };
            }

            /**
             * Measures the total width of a text string after applying a specified number of pixels between the
             * letters
             * @param canvasContext - the canvas on which the text will be drawn
             * @param text - the text string to be measured
             * @param letterSpacing - the number of pixels to be inserted in between the letters of the text
             * @returns {number} - the total width of the text string after the spacing between letters has been
             * applied
             */
            function measureTextSpacing(canvasContext, text, letterSpacing) {

                var splitStrArr = String.prototype.split.call(text, "");
                var totalWidth = 0;

                for (var i = 0; i < splitStrArr.length; i++) {
                    totalWidth += canvasContext.measureText(splitStrArr[i]).width + letterSpacing;
                }

                return totalWidth;
            }

            /**
             * Draws text with a black shadow onto a canvas at the given coordinates with a defined spacing between
             * letters.
             * @param canvasContext - the canvas on which the text will be drawn
             * @param x - the x coordinate where the text will be rendered
             * @param y - the y coordinate where the text will be rendered
             * @param text - the text to be rendered
             * @param letterSpacing - the number of pixels to be inserted in between the letters of the text
             */
            function drawShadowText(canvasContext, x, y, text, letterSpacing) {

                // Give the text a shadow background to make it stand out
                var shadowMatrix = [[-1, -1], [1, 1], [-1, 1], [1, -1]];
                canvasContext.shadowColor = "#000000";
                canvasContext.shadowBlur  = 5;
                canvasContext.lineWidth   = 3;

                for (var i = 0; i < shadowMatrix.length; ++i) {

                    canvasContext.shadowOffsetX = shadowMatrix[i][0];
                    canvasContext.shadowOffsetY = shadowMatrix[i][1];

                    // Create the text "shadow" by drawing the outline in black
                    canvasContext.fillStyle = "#000000"; // #000000 = black
                    strokeSpacingText(canvasContext, text, x, y, letterSpacing);
                }

                // Create the white text fill
                canvasContext.fillStyle = "#FFFFFF"; // #FFFFFF = white
                fillSpacingText(canvasContext, text, x, y, letterSpacing);
            }

            /**
             * Extend the fillText function to insert a specified number of pixels in between letters
             * @param canvasContext - the canvas on which the text will be drawn
             * @param text - the text to be rendered
             * @param x - the x coordinate where the text will be rendered
             * @param y - the y coordinate where the text will be rendered
             * @param letterSpacing - the number of pixels to be inserted in between the letters of the text
             */
            function fillSpacingText(canvasContext, text, x, y, letterSpacing) {

                var fillText = function(text, x, y) {
                    canvasContext.fillText(text, x, y);
                };

                customText(canvasContext, fillText, text, x, y, letterSpacing);
            }

            /**
             * Extend the strokeText function to insert a specified number of pixels in between letters
             * @param canvasContext - the canvas on which the text will be drawn
             * @param text - the text to be rendered
             * @param x - the x coordinate where the text will be rendered
             * @param y - the y coordinate where the text will be rendered
             * @param letterSpacing - the number of pixels to be inserted in between the letters of the text
             */
            function strokeSpacingText(canvasContext, text, x, y, letterSpacing) {

                var strokeText = function(text, x, y) {
                    canvasContext.strokeText(text, x, y);
                };

                customText(canvasContext, strokeText, text, x, y, letterSpacing);
            }

            /**
             * Calculates the spacing between letters, the spacing between lines, and the position of the text
             * elements to be rendered before calling the function which draws the text onto the canvas.
             * @param canvasObj - the canvas on which the text will be drawn
             * @param canvasContext - the context of the canvas
             * @param overlay - the text object which will be drawn onto the canvas. It is expected to have the
             * following structure:
             *      {
                text: (string),
                el: (jquery element),
                fontsize: (string)
            }
             */
            function renderText(canvasObj, canvasContext, settings, overlay) {

                validateOverlay(overlay);

                applyLineBreaks(overlay);

                var txtLineArr = overlay.text.split("\n");
                var txtLineArrLength = txtLineArr.length;
                var letterSpacing = 0;
                var position = getPositionWithinCanvas(canvasObj, overlay.el);
                var newLinePadding = Math.floor(overlay.fontsize / 6) + 2;

                canvasContext.font = overlay.fontsize + "px " + ((settings && settings.fontStyle) || "");

                for (var j = 0; txtLineArrLength > j; j++) {

                    var currentLine = txtLineArr[j];
                    var m = 0.5 * (overlay.el.width() - measureTextSpacing(canvasContext, currentLine, letterSpacing));
                    var n = position.left + m;
                    var o = position.top + overlay.fontsize * (j + 1) + newLinePadding * j;

                    drawShadowText(canvasContext, n, o, currentLine, letterSpacing);
                }
            }

            /**
             * Draws an image onto the canvas.
             * @param domObj
             * @param domObjCont
             * @param context
             * @param image
             */
            function renderImage(domObj, domObjCont, context, image, wrapImage) {

                var containerWidth = domObjCont.width();
                var imageWidth = image.width();
                var imageHeight = image.height();
                var offsetToCenter = (containerWidth - imageWidth) / 2;

                if(wrapImage) {
                    domObj.css('left', offsetToCenter + 'px');
                }

                context.drawImage(image.get(0), 0, 0, imageWidth, imageHeight);
            }

            /**
             * Resizes the canvas
             * @param domObj - the canvas to be resized
             * @param width
             * @param height
             */
            function resizeCanvas(domObj, width, height) {
                (width && height) || throwErr('resizeCanvas() : width and height parameters must be defined');
                domObj.attr('width', width);
                domObj.attr('height', height);
            }

            /**
             * Sets the CSS properties of the canvas
             * @param domObj - the canvas object
             * @param options
             */
            function setCanvasCss(domObj, options) {
                options || throwErr('setCanvasPosition() : options parameter must be defined');
                domObj.css(options);
            }

            function validateOverlay(overlay) {

                overlay          || throwErr('overlay must be defined');
                overlay.text     || throwErr('overlay.text must be defined');
                overlay.el       || throwErr('overlay.el must be defined');
                overlay.fontsize || throwErr('overlay.fontsize must be defined');

                return true;
            }

            /**
             * Detects when text causes horizontal scrolling in a text area and inserts a line break character
             * @param overlay - the text object to which we will apply the line breaks. It is expected to have the
             * following structure:
             *      {
                text: (string),
                el: (jquery element),
                fontsize: (string)
            }
             */
            function applyLineBreaks(overlay) {
                var textEl = overlay.el.find('textarea').get(0);

                if (textEl.wrap)
                    textEl.setAttribute("wrap", "off");
                else {
                    textEl.setAttribute("wrap", "off");

                    var textElClone = textEl.cloneNode(!0);
                    textElClone.value = textEl.value, textEl.parentNode.replaceChild(textElClone, textEl), textEl = textElClone
                }

                var tempTextEl = textEl.value;
                textEl.value = "";
                var cutoffScrollWidth = textEl.scrollWidth;
                var e = -1;

                for (var i = 0; i < tempTextEl.length; i++) {

                    var currentChar = tempTextEl.charAt(i).toUpperCase();

                    // TODO: Find another way to achieve a more readable control flow
                    if ((" " == currentChar || "-" == currentChar || "+" == currentChar) && (e = i), textEl.value += currentChar, textEl.scrollWidth > cutoffScrollWidth) {

                        var trimText = "";
                        if (e >= 0) {
                            for (var j = e + 1; i > j; j++)
                                trimText += tempTextEl.charAt(j);
                            e = -1;
                        }
                        trimText += currentChar;
                        textEl.value = textEl.value.substr(0, textEl.value.length - trimText.length); // take off word that is causing scrolling
                        textEl.value = $.trim(textEl.value); // take off any trailing spaces
                        textEl.value += "\n" + trimText.toUpperCase();
                    }
                }
                textEl.setAttribute("wrap", "");

                overlay.text = textEl.value;
            }

            /**
             * This function creates an image from the canvas and returns it as an png file
             * @param domObj - the canvas from which we are generating the image
             * @returns {Blob} - the newly created image file
             */
            function getCanvasAsImg(domObj) {
                var dataUrl = domObj.get(0).toDataURL();

                var blobBin = atob(dataUrl.split(',')[1]);
                var array = [];

                for (var i = 0; i < blobBin.length; i++) {
                    array.push(blobBin.charCodeAt(i));
                }

                return new Blob([new Uint8Array(array)], {type: 'image/png'});
            }

            /**
             * Executes any custom text rendering function that takes a text string, a x coordinate, and a y
             * coordinate.
             * @param canvasContext - the canvas on which the text will be drawn
             * @param textFn - the text rendering function to be executed
             * @param text - the text to be rendered
             * @param x - the x coordinate where the text will be rendered
             * @param y - the y coordinate where the text will be rendered
             * @param letterSpacing - the number of pixels to be inserted in between the letters of the text
             */
            function customText(canvasContext, textFn, text, x, y, letterSpacing) {

                if (text && "string" == typeof text && 0 !== text.length) {

                    "undefined" == typeof letterSpacing && (letterSpacing = 0);

                    var splitStrArr = String.prototype.split.call(text, "");
                    var xCoord = x;
                    var j = 1;

                    if ("right" === canvasContext.textAlign) {

                        splitStrArr = splitStrArr.reverse();
                        j = -1;

                    } else if ("center" === canvasContext.textAlign) {

                        var textWidth = this.measureTextSpacing(canvasContext, text, letterSpacing);
                        xCoord = x - textWidth / 2;

                    }

                    for (var h = 0; h < text.length; h++) {

                        var currentChar = splitStrArr[h];
                        textFn(currentChar, xCoord, y);
                        xCoord += j * (canvasContext.measureText(currentChar).width + letterSpacing);

                    }
                }
            }

            function throwErr() {
                throw new Error('error in ng-canvas.js: ' + msg);
            }

            // Return a constructor. We do this so that multiple canvases can be initialized on one page. If we used a service,
            // only one canvas could be initialized per page.
            return function(options) {

                var settings   = options.settings   || {};
                var domObj     = options.domObj     || throwErr('a canvas dom object must be defined');
                var domObjCont = options.domObjCont || throwErr('a container for the canvas dom object must be defined');
                var width      = options.width      || undefined; // Width will default to width of domObj
                var height     = options.height     || undefined; // Height will default to height of domObj
                var image      = options.image      || undefined;
                var wrapImage  = options.wrapImage  || undefined;

                var context = domObj.get(0).getContext('2d');
                lodash.extend(context, settings);

                // Wrap canvas around image, draw the image onto the canvas
                if(image && wrapImage) {
                    var containerWidth = domObjCont.width();
                    var imageWidth = image.width();
                    var imageHeight = image.height();
                    var offsetToCenter = (containerWidth - imageWidth) / 2;

                    domObj.css('left', offsetToCenter + 'px');
                    resizeCanvas(domObj, image.width(), image.height());
                    $(window).resize(function() {
                        resizeCanvas(domObj, image.width(), image.height());
                    });
                    context.drawImage(image.get(0), 0, 0, imageWidth, imageHeight);
                }
                // If a width and height are specified, they override image width and height
                if(width) {
                    domObj.attr('width', width);
                }
                if(height) {
                    domObj.attr('height', height);
                }

                this.getPositionWithinCanvas = getPositionWithinCanvas;
                this.measureTextSpacing      = measureTextSpacing;
                this.drawShadowText          = drawShadowText;
                this.fillSpacingText         = fillSpacingText;
                this.strokeSpacingText       = strokeSpacingText;
                this.drawText                = lodash.partial(renderText, domObj, context, settings);
                this.drawImage               = lodash.partial(renderImage, domObj, domObjCont, context);
                this.resizeCanvas            = lodash.partial(resizeCanvas, domObj);
                this.setCanvasCss            = lodash.partial(setCanvasCss, domObj);
                this.getCanvasAsImg          = lodash.partial(getCanvasAsImg, domObj);
            }
        });
}));