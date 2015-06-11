/**
 * Created by hunterhodnett on 4/24/15.
 */

(function ( factory ) {

    var angular     = window.angular;
    var template = require('html-loader!./caption-text-view.html');
    factory(angular, template);

}( function( angular, template, undefined ) {

    angular
        .module('MemeSubmission')
        .directive('captiontext', ['$document', function ($document) {
            "use strict";

            return {
                template: template,
                restrict: 'E',
                scope: {
                    id: '=',
                    class: '@',
                    placeholdertext: '@',
                    fontsize: '@'
                },
                controller: function ($scope, $element) {

                    var container = $element.find('textarea');
                    // Make sure that the container is a textarea since this component isn't designed for other elements
                    if (!container.length) {
                        throw new Error('container must be a textarea');
                    }

                    var shadow = createShadowEL();
                    $document.find('body').eq(0).append(shadow);

                    // Set the font size of our elements to the specified font size
                    setTextareaCss({'font-size': $scope.fontsize + 'px'});

                    var text = container.val();

                    $scope.keyUpHandler = function (keyCode) {
                        if (27 === keyCode) {
                            container.val(text);
                        } else if (container.val().length) {
                            text = container.val();
                            fitTextWrap();
                        } else {
                            text = ' ';
                            shadow.hasClass('placeHolder') && shadow.removeClass('placeHolder');
                            shadow.val(text);
                        }
                    };

                    $scope.keyDownHandler = function (keyCode) {
                        // Update the hidden text element with the character to be added so that we can see if the font size
                        // will need to be changed. Also convert the character to be added to uppercase.
                        shadow.val(container.val() + String.fromCharCode(keyCode));

                        while ((container.get(0).scrollHeight - 4) > shadow.height() && $scope.fontsize > 0) {
                            setFontSize(--$scope.fontsize);
                        }
                    };

                    /**
                     * Put text in hidden element and update the hidden element before we update the real element to decide if
                     * we need to do a font resize
                     */
                    function createShadowEL() {
                        var shadow = angular.element('<textarea class="caption caption-textarea" wrap="on">' + text + '</textarea>');
                        shadow.css({
                            position: 'absolute',
                            left: '-9999px',
                            top: '-9999px',
                            visibility: 'hidden'
                        });

                        return shadow;
                    }

                    /**
                     * Determines whether to shrink the font or enlarge the font so that the text will fit in the textarea
                     */
                    function fitTextWrap() {

                        if (text && text.length) {
                            while ((container.get(0).scrollHeight - 4) <= container.height() && $scope.fontsize < 1000) {
                                setFontSize(++$scope.fontsize);
                            }
                            while ((container.get(0).scrollHeight - 4) > container.height() && $scope.fontsize > 0) {
                                setFontSize(--$scope.fontsize);
                            }
                        }
                    }

                    /**
                     * Updates the font size to a new value
                     * @param newFontSize
                     */
                    function setFontSize(newFontSize) {
                        $scope.fontsize = newFontSize;
                        container.parent().parent().attr('fontSize', $scope.fontsize); //FIXME: find a way to closure element so I don't have to traverse up the DOM tree. It's not binding for some reason
                        setTextareaCss({'font-size': $scope.fontsize + 'px'});
                    }

                    /**
                     * Apply one set of CSS rules to all of our elements
                     * @param cssStyles
                     */
                    function setTextareaCss(cssStyles) {
                        container.css(cssStyles);
                        shadow.css(cssStyles);
                    }
                }
            };
        }]);
}));
