// Def functions
var mnt = mnt || {};

mnt.init = function() {
	var _self = this;

	_self.methods.init();
};

mnt.consts = {
	outputTagForStyles: 'body',
	boldElements: ['.hljs-keyword', '.hljs-attribute', '.hljs-selector-tag', '.hljs-meta-keyword', '.hljs-doctag', '.hljs-name', '.hljs-title', '.hljs-section', 'strong', 'b'],
    otFeaturesDefault: ['calt', 'ccmp', 'clig', 'curs', 'kern', 'liga', 'locl', 'mark', 'mkmk', 'rclt', 'rlig'],
    otFeaturesShowable: ['afrc', 'c2pc', 'c2sc', 'calt', 'case', 'ccmp', 'clig', 'cpsp', 'cswh', 'curs', 'dlig', 'dnom', 'expt', 'falt', 'frac', 'fwid', 'halt', 'hist', 'hlig', 'hngl', 'hojo', 'hwid', 'ital', 'jalt', 'jp04', 'jp78', 'jp83', 'jp90', 'kern', 'liga', 'lnum', 'locl', 'mark', 'mgrk', 'mkmk', 'nalt', 'nlck', 'numr', 'onum', 'ordn', 'ornm', 'palt', 'pcap', 'pkna', 'pnum', 'pwid', 'qwid', 'rand', 'rclt', 'rlig', 'ruby', 'rvrn', 'salt', 'sinf', 'smcp', 'smpl', 'subs', 'sups', 'swsh', 'titl', 'tnam', 'tnum', 'trad', 'twid', 'unic', 'vhal', 'vpal', 'zero', 'ss01', 'ss02', 'ss03', 'ss04', 'ss05', 'ss06', 'ss07', 'ss08', 'ss09', 'ss10', 'ss11', 'ss12', 'ss13', 'ss14', 'ss15', 'ss16', 'ss17', 'ss18', 'ss19', 'ss20'],
	documentParts: ['header', 'body'],
	cssVars: {
		ffs: '--font-feature-settings',
		fvs: '--font-variation-settings',
		fvsb: '--font-variation-settings-bold',
		fontFamily: '--font-family'
	}
};

mnt.fonts = {};

mnt.elements = {
	jsCustomStylesheet: document.getElementById('jsCustomStylesheet').sheet
};

mnt.helpers = {
    /**
	 * Checks if CSS property is supported
     * @param {string} property
     * @returns {boolean}
     */
    isPropertySupported: function(property) {
        return property in document.body.style;
    },

    /**
	 * Returns string for bold font variant
     * @param {string} fontSettings
     * @param {string} fontName
	 * @returns {string}
     */
    getFontVariationBold: function(fontSettings, fontName) {
        return mnt.fonts[fontName].bold ? fontSettings.replace(/^(.*?'wght' )([\d.]*)(.*)$/, '$1' + mnt.fonts[fontName].bold + '$3') : null;
    },

    /**
	 * Builds a string with complete CSS rule
     * @param {string} selector
     * @param {string} property
     * @param {string|number} value
     * @returns {string}
     */
    setCssRule: function(selector, property, value) {
        return selector + ' { ' + property + ': ' + value + '; }';
    },

    /**
	 * Builds font variation settings array and sets value for bold
     * @param {string} fontName
     * @param {string} settingsType
     * @param {Object} [options = {}]
     * @returns {Array}
     */
    buildFontCssSettings: function(fontName, settingsType, options) {
        var options = options || {},
			fonts = mnt.fonts,
            fontSettings = [],
            feature,
            axis,
            value;

        if (settingsType === 'feature') {
            var fontFeature = fonts[fontName].feature;
            for (feature in fontFeature) {
				if (fontFeature.hasOwnProperty(feature)) {
                    if (options.hasOwnProperty(feature)) {
                        fontSettings.push("'" + feature + "' " + options[feature]);
                    } else {
                        fontSettings.push("'" + feature + "' " + fontFeature[feature]);
					}
                }
			}

            return fontSettings;
        }

        if (settingsType === 'variation') {
        	var fontVariation = fonts[fontName].variation;
            for (axis in fontVariation) {
                if (fontVariation.hasOwnProperty(axis)) {
                    if (options.hasOwnProperty(axis)) {
                        value = options[axis];
                    } else {
                        value = fontVariation[axis].value || fontVariation[axis].default;
                    }
                    fontSettings.push("'" + axis + "' " + value);
                    if (axis === 'wght') {
                        fonts[fontName].bold = mnt.helpers.setWghtAxisBoldValue(value, fontVariation[axis].max);
                    }
                }
            }

            return fontSettings;
        }
    },

    /**
	 * Sets bold weight value
     * @param {number} value
     * @param {number} maxValue
     * @returns {number}
     */
    setWghtAxisBoldValue: function(value, maxValue) {
        return parseInt(value) + (maxValue - value) * 0.6;
    }
};

mnt.methods = {
	init: function() {
		var _self = this,
			fontPathArray = ['./fonts/Monoto-VF.woff', './fonts/VotoSerifGX.woff'];

		_self.incompatibilityInform();
        //_self.getFontObject(['./fonts/Monoto-VF.woff', './fonts/VotoSerifGX.woff'], mnt.methods.updateFontsObject);
        for (var index = 0; index < fontPathArray.length; index++) {
            _self.getFontObject(fontPathArray[index])
                .then(function(fontInfo) {
                    mnt.methods.updateFontsObject(fontInfo);
                    document.getElementsByTagName('body')[0].classList.remove('fonts-loading');
                })
                .catch(function (error) {
                    console.error('Augh, there was an error!', error);
                });
		}
	},

    /**
	 * Fires an alert for users with incompatible browsers
     */
	incompatibilityInform: function() {
		if (!mnt.helpers.isPropertySupported('fontVariationSettings')) {
			alert('Whoa, hold your horses Dude! Your browser doesn\'t support core functionality: font-variation-settings! \nSwitch to Webkit Nightly / Safari Technology Preview / Chrome Canary* browser to check out this cool cutting-edge feature! \n\n* with "Experimental Web Platform features" flag enabled.');
			console.error('Whoa, hold your horses Dude! Your browser doesn\'t support core functionality: font-variation-settings! \nSwitch to Webkit Nightly / Safari Technology Preview / Chrome Canary* browser to check out this cool cutting-edge feature! \n\n* with "Experimental Web Platform features" flag enabled.');
		}
	},

    /**
	 * Updates value and position of output. Saves value to the font object.
     * @param {Element} element - range input
     */
	updateOutputTag: function(element) {
		var children = element.parentNode.children,
			rangeThumbWidth = 10,
			width = element.offsetWidth - rangeThumbWidth,
			newPointPosition = (element.value - element.getAttribute('min')) / (element.getAttribute('max') - element.getAttribute('min')),
			offset = 1.3,
			outputTag;

        if (newPointPosition < 0) {
        	newPointPosition = 0;
		} else if (newPointPosition > 1) {
        	newPointPosition = width;
		} else {
        	var oldPos = newPointPosition;
        	newPointPosition = width * newPointPosition + offset;
        	offset -= oldPos;
		}
		
		for (var index = 0; index < children.length; index++) {
			if (children[index].tagName.toLowerCase() === 'output') {
				mnt.fonts[element.dataset.fontName].variation[element.name].value = element.value;
				outputTag = children[index];
				outputTag.value = element.value;
				outputTag.style.left = newPointPosition + 'px';
				outputTag.style.marginLeft = offset + '%';
            }
		}
	},

    updateFontFeatureSettings: function(element) {
		mnt.fonts[element.dataset.fontName].feature[element.name] = element.checked ? 1 : 0;
	},

    /**
	 * Builds inputs for font variation settings and font feature settings
     * @param {string} propertyName
     * @param {Object} fontProperty
     * @param {string} fontName
     * @param {boolean} isRadioSelected
     */
	buildInputs: function(propertyName, fontProperty, fontName, isRadioSelected) {
		var inputsSectionId = fontName + '-settings',
			inputsSection = document.getElementById(inputsSectionId),
            fragment = document.createDocumentFragment(),
			input,
			label,
			feature,
			axis;

		if (typeof fontProperty !== 'object') {
			return;
		}

		if (!inputsSection) {
            inputsSection = document.createElement('ul');
            inputsSection.id = inputsSectionId;
			inputsSection.classList.add('font-settings');
			if (isRadioSelected) {
                inputsSection.classList.add('selected');
			}
            document.getElementById('settingsSection').appendChild(inputsSection);
		}

		if (propertyName === 'feature') {
            var fieldset = document.createElement('fieldset');
            fieldset.classList.add('checkboxes');
            for (feature in fontProperty) {
            	if (fontProperty.hasOwnProperty(feature)) {
                    input = document.createElement('input');
                    label = document.createElement('label');

                    input.type = 'checkbox';
                    input.checked = fontProperty[feature];
                    input.name = feature;
                    input.setAttribute('data-font-name', fontName);

                    label.innerText = feature;

                    fragment.appendChild(label).appendChild(input);
                    mnt.methods.addFeatureCheckboxListener(input);
				}
			}

            inputsSection.appendChild(fieldset).appendChild(fragment);

			return;
		}

        if (propertyName === 'variation') {
            for (axis in fontProperty) {
                if (fontProperty.hasOwnProperty(axis)) {
                    var listNode = document.createElement('li'),
                        output = document.createElement('output');

                    input = document.createElement('input');
                    label = document.createElement('label');

                    listNode.classList.add('input-set', 'range');

                    output.value = fontProperty[axis].default;

                    input.id = fontName + '-' + axis;
                    input.setAttribute('data-font-name', fontName);
                    input.name = axis;
                    input.type = 'range';
                    input.min = fontProperty[axis].min;
                    input.max = fontProperty[axis].max;
                    input.value = fontProperty[axis].default;

                    label.htmlFor = fontName + axis;
                    label.innerText = axis;

                    fragment.appendChild(output);
                    fragment.appendChild(input);
                    fragment.appendChild(label);
                    inputsSection.appendChild(listNode).appendChild(fragment);

                    mnt.methods.addAxisSliderListener(input);
                    mnt.methods.updateOutputTag(input);
                }
            }
		}
	},

    /**
	 * Adds listener for axis range inputs
	 * @param {Element} input - range input with axis value slider
     */
	addAxisSliderListener: function(input) {
        input.addEventListener('input', function() {
            mnt.methods.updateOutputTag(input);
            mnt.methods.setFontSettingsStyles(input.dataset.fontName);
        }, false);
	},

    /**
     * Adds listener for feature settings checkboxes
     * @param {Element} input - range input with axis value slider
     */
    addFeatureCheckboxListener: function(input) {
        input.addEventListener('change', function() {
        	mnt.methods.updateFontFeatureSettings(input);
            mnt.methods.setFontSettingsStyles(input.dataset.fontName);
        }, false);
    },

    /**
	 * Adds listener for font name radio inputs
     * @param {Element} fontNameRadio - input radio with font name
     */
	addFontNameRadioListener: function(fontNameRadio) {
        fontNameRadio.addEventListener('change', function() {
            var currentFontSettingsSection = document.getElementById(this.id + '-settings');
            document.querySelector('.font-settings.selected').classList.remove('selected');
            currentFontSettingsSection.classList.add('selected');
            for (var liIndex = 0; liIndex < currentFontSettingsSection.childNodes.length; liIndex++) {
                var listElement = currentFontSettingsSection.childNodes[liIndex];
                for (var elIndex = 0; elIndex < listElement.childNodes.length; elIndex++) {
                    var rangeInput = listElement.childNodes[elIndex];
                    if (rangeInput.tagName === 'INPUT') {
                        mnt.methods.updateOutputTag(rangeInput);
                        mnt.methods.setFontSettingsStyles(rangeInput.dataset.fontName);
                    }
                }
            }
        }, false);
	},

    /**
	 *
     * @param {Object} options - options for CSS rules
	 * @param {string} options.property - CSS property name
     * @param {Element} [options.stylesheet = mnt.elements.jsCustomStylesheet] - stylesheet, that should should receive new CSS rule
     * @param {string} [options.selector = ':root'] - CSS selector
     * @param {string} [options.value] - CSS value for selected property
     */
    insertCssRule: function(options) {
        var stylesheet = options.stylesheet || mnt.elements.jsCustomStylesheet,
            selector = options.selector || ':root',
            value = options.value || '',
            property = options.property,
            valueOverwritten = false;

        if (!stylesheet.cssRules.length) {
            stylesheet.insertRule(
                mnt.helpers.setCssRule(selector, property, value),
				stylesheet.cssRules.length
            );
            return;
        }

        for (var index = 0; index < stylesheet.cssRules.length; index++) {
            if (stylesheet.cssRules[index].selectorText === selector && stylesheet.cssRules[index].style[0] === property) {
                stylesheet.cssRules[index].style.cssText = property + ': ' + value;
                valueOverwritten = true;
            }
        }

        if (!valueOverwritten) {
            stylesheet.insertRule(
                mnt.helpers.setCssRule(selector, property, value),
				stylesheet.cssRules.length
            );
        }
    },

    /**
	 * Injects styles to CSS variables
     * @param {string} fontName
     */
	setFontSettingsStyles: function(fontName) {
		var fontFeatureSettingsValue = mnt.helpers.buildFontCssSettings(fontName, 'feature').join(', '),
			fontVariationSettingsValue = mnt.helpers.buildFontCssSettings(fontName, 'variation').join(', '),
            fontVariationSettingsBoldValue = mnt.helpers.getFontVariationBold(fontVariationSettingsValue, fontName);

        mnt.methods.insertCssRule({
            property: mnt.consts.cssVars.ffs,
            value: fontFeatureSettingsValue
        });

        mnt.methods.insertCssRule({
            property: mnt.consts.cssVars.fvs,
            value: fontVariationSettingsValue
        });

        if (fontVariationSettingsBoldValue) {
            mnt.methods.insertCssRule({
                property: mnt.consts.cssVars.fvsb,
                value: fontVariationSettingsBoldValue
            });
		}
        mnt.methods.insertCssRule({
            property: mnt.consts.cssVars.fontFamily,
            value: fontName
        });
	},

    /**
	 * Gets and parses font to object
     * @param {string} fontPath
     */
	getFontObject: function(fontPath) {
		return  new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', fontPath);
			xhr.responseType = 'arraybuffer';

			xhr.onload = function() {
				if (this.readyState === 4 && this.status === 200) {
					var fkBlob = this.response,
						fkBuffer = new Buffer(fkBlob),
						link = document.createElement('link'),
						fontInfo;
					fontInfo = fontkit.create(fkBuffer);
					link.rel = 'stylesheet';
					link.type = 'application/font-woff';
					link.href = this.responseURL;
					document.getElementsByTagName('head')[0].appendChild(link);
					resolve(fontInfo);
				} else {
					reject(Error(xhr.statusText));
				}
			};

			xhr.onerror = function(error) {
				reject(Error('An error occured: ' + error.message));
			};

			xhr.send();
		});
	},

    /**
	 * Extracts necessary info from font object and fills mnt.fonts object
     * @param fontInfo
     */
	updateFontsObject: function(fontInfo) {
        var lineHeight,
			availableFeatures = fontInfo.availableFeatures,
			features = {},
			fontInfo_OS2 = fontInfo['OS/2'];

        if (fontInfo_OS2) {
        	lineHeight = (fontInfo_OS2.typoAscender - fontInfo_OS2.typoDescender + fontInfo_OS2.typoLineGap) / fontInfo.head.unitsPerEm;
        } else {
        	lineHeight = (fontInfo.hhea.ascent - fontInfo.hhea.descent + fontInfo.hhea.lineGap) / fontInfo.head.unitsPerEm;
        }

        if (availableFeatures) {
			for (var index = 0; index < availableFeatures.length; index++) {
                var feature = availableFeatures[index],
					isShowable = mnt.consts.otFeaturesShowable.indexOf(feature) > -1,
                    isDefault = mnt.consts.otFeaturesDefault.indexOf(feature) > -1;
                if (isShowable) {
                	features[feature] = isDefault ? 1 : 0;
				}
			}
		}

        mnt.fonts[fontInfo.postscriptName] = {
        	'line-height': lineHeight || 1.2,
			variation: fontInfo.variationAxes,
			feature: features
        };

        mnt.methods.buildSettingsSection(fontInfo.postscriptName);
	},

    /**
	 * Builds settings section
     * @param {string} fontName
     */
	buildSettingsSection: function(fontName) {
		var fontNameSelect = document.getElementById('fontName'),
            radio = document.createElement('input'),
            label = document.createElement('label'),
            fragment = document.createDocumentFragment(),
			font = mnt.fonts[fontName],
			isRadioSelected = false,
			property;
		if (!fontNameSelect) {
            fontNameSelect = document.createElement('fieldset');
            fontNameSelect.id = 'fontName';
			document.getElementById('settingsSection').appendChild(fontNameSelect);
            isRadioSelected = true;
		}
		label.innerHTML = fontName;
		label.htmlFor = fontName;
		radio.type = 'radio';
		radio.id = fontName;
		radio.name = 'font-name';
        radio.value = fontName;
        radio.innerHTML = fontName;
        radio.checked = isRadioSelected;
        fragment.appendChild(radio);
        fragment.appendChild(label);
        fontNameSelect.appendChild(fragment);

        for (property in font) {
        	if (font.hasOwnProperty(property)) {
                mnt.methods.buildInputs(property, font[property], fontName, isRadioSelected);
			}
		}

		mnt.methods.addFontNameRadioListener(radio);

        if (isRadioSelected) {
            mnt.methods.setFontSettingsStyles(fontName);
		}
	}
};

mnt.adjustElementWidth = {
    /**
	 *
     */
    getTitleInputInnerWidth: function() {
    	mnt.adjustElementWidth.buildOptions();
        mnt.adjustElementWidth.options.editableElement.removeEventListener('input', mnt.adjustElementWidth.listener);
        mnt.adjustElementWidth.options.editableElement.addEventListener('input', mnt.adjustElementWidth.listener);
    },
    options: {},

    /**
	 *
     */
    buildOptions: function() {
        var options = mnt.adjustElementWidth.options;

        options.editableElement = document.getElementsByTagName('h1')[0];
        options.ghostSpan = document.createElement('span');
        options.editableElementComputedStyles = window.getComputedStyle(options.editableElement, null);
        options.editableElementWidth = options.editableElement.clientWidth;
        options.ghostSpan.style.color = 'transparent';
        options.ghostSpan.style.top = '-100vh';

        options.ghostSpan.innerText = options.editableElement.innerText;
        document.getElementsByTagName('footer')[0].appendChild(options.ghostSpan);
    },

    /**
	 *
     */
    listener: function() {
        var index = 0,
            options = mnt.adjustElementWidth.options,
			axisMinValue = 0,
            axisMaxValue = 0;
        options.axisName = 'wdth';
        mnt.adjustElementWidth.setStyles(options);
        if (!options.fontName ||
			!mnt.fonts.hasOwnProperty(options.fontName) ||
			!mnt.fonts[options.fontName].variation.hasOwnProperty(options.axisName)) {
            return;
        }
        options.axis = mnt.fonts[options.fontName].variation[options.axisName];
        options.currentAxisValue = mnt.adjustElementWidth.getCurrentAxisValue(options.axisName);

        if (options.ghostSpan.clientWidth >= options.editableElementWidth) {
            axisMinValue = options.axis.min;
            axisMaxValue = options.currentAxisValue;
        }
        if (options.ghostSpan.clientWidth < options.editableElementWidth) {
            axisMinValue = options.currentAxisValue;
            axisMaxValue = options.axis.max;
        }
        
        mnt.adjustElementWidth.binarySearch(axisMinValue, axisMaxValue, options, index);
    },

    /**
	 *
     * @param {String} axisName
     * @returns {Number}
     */
    getCurrentAxisValue: function(axisName) {
		var value = 0;
		mnt.adjustElementWidth.options.ghostSpan.style.fontVariationSettings.split(', ').forEach(function(axisValueString) {
        	var axisValueArray = axisValueString.split(' ');
        	for (var index = 0; index < axisValueArray.length; index ++) {
        		if (axisValueArray[index] === "'" + axisName + "'") {
                    value = parseInt(axisValueArray[index + 1]);
                    return;
				}
			}
        });

        return value;
    },

    /**
	 *
     * @param {Object} options
     * @returns {null}
     */
    setStyles: function(options) {
        var property;
        if (!options.editableElementComputedStyles) {
        	console.error('Couldn\'t compute styles of: ' + options.editableElement);
            return null;
        }

        for (property in options.editableElementComputedStyles) {
            if (options.editableElementComputedStyles.hasOwnProperty(property) &&
				mnt.adjustElementWidth.isStylePropertyValid(options.editableElementComputedStyles[property])) {
                options.ghostSpan.style[property] = options.editableElementComputedStyles[property];
            }
        }

        options.ghostSpan.innerText = options.editableElement.innerText;
        options.ghostSpan.style.position = 'absolute';
        options.ghostSpan.style.width = 'auto';
        options.ghostSpan.style.color = 'transparent';
        options.ghostSpan.style.top = '-100vh';

        options.fontName = options.ghostSpan.style.fontFamily.split(', ')[0];
    },

    binarySearch: function(min, max, options, index) {
    	var delta,
            axisData = {};
        if (index > 10) {
            return;
        }

        index++;

        options.currentAxisValue = Math.floor(((max - min) / 2) + min);
        axisData[options.axisName] = options.currentAxisValue;
        options.fvsValue = mnt.helpers.buildFontCssSettings(options.fontName, 'variation', axisData).join(', ');
        options.editableElement.style.fontVariationSettings = options.fvsValue;
        options.ghostSpan.style.fontVariationSettings = options.fvsValue;

        delta = options.editableElementWidth - options.ghostSpan.clientWidth;

        if ((delta <= (options.editableElementWidth * 0.01) && delta > 0) || (min === max)) {
            return;
        }

        if (options.ghostSpan.clientWidth >= options.editableElementWidth) {
            max = parseInt(options.currentAxisValue);
        }

        if (options.ghostSpan.clientWidth < options.editableElementWidth) {
            min = parseInt(options.currentAxisValue);
        }

        mnt.adjustElementWidth.binarySearch(min, max, options, index);
    },

    isStylePropertyValid: function(value) {
        return typeof value !== 'undefined' &&
            typeof value !== 'object' &&
            typeof value !== 'function' &&
            value.length > 0 &&
            value !== parseInt(value);
    }
};

// Start everything
document.addEventListener('DOMContentLoaded', function() {
	mnt.init();
	mnt.adjustElementWidth.getTitleInputInnerWidth();
});