var matrixes = {
    "1/4": { w: 3.6, h: 2.7 },
    "1/3": { w: 4.8, h: 3.6 },
    "1/2.3": { w: 6.16, h: 4.62 },
    "1/2": { w: 6.4, h: 4.8 },
    "1/1.8": { w: 7.2, h: 5.3 },
    "2/3": { w: 8.8, h: 6.6 },
    "1/1.2": { w: 11.30, h: 7.13 },
    "1": { w: 12.8, h: 9.6 },
    "1.1": { w: 14.16, h: 10.37 },
    "4/3": { w: 17.3, h: 13.0 },
    "22": { w: 15.55, h: 15.55 },
    "43": { w: 36.0, h: 24.0 },
};

var resolutions = {
    "640x480": { w: 640, h: 480 },
    "720x480": { w: 720, h: 480 },
    "768x576": { w: 768, h: 576 },
    "800x600": { w: 800, h: 600 },
    "1024x768": { w: 1024, h: 768 },
    "1280x720": { w: 1280, h: 720 },
    "1280x768": { w: 1280, h: 768 },
    "1280x960": { w: 1280, h: 960 },
    "1280x1024": { w: 1280, h: 1024 },
    "1320x736": { w: 1320, h: 736 },
    "1600x1200": { w: 1600, h: 1200 },
    "1920x1080": { w: 1920, h: 1080 },
    "2048x1080": { w: 2048, h: 1080 },
    "1920x1200": { w: 1920, h: 1200 },
    "2048x1536": { w: 2048, h: 1536 },
    "2048x2048": { w: 2048, h: 2048 },
    "2560x1600": { w: 2560, h: 1600 },
    "2560x2048": { w: 2560, h: 2048 },
    "3088x2076": { w: 3088, h: 2076 },
    "4000x3000": { w: 4000, h: 3000 },
    "4912x3684": { w: 4912, h: 3684 },
    "5120x5120": { w: 5120, h: 5120 },
    "6600x4400": { w: 6600, h: 4400 },
};

(function () {
    var selectors = {
        "osc-matrix_format": matrixes,
        "osc-resolution": resolutions,
        "flc-matrix_format": matrixes
    }
    function onSelectorChanged(e) {
        var selector = this,
            width_field = document.getElementById(selector.id + "-width"),
            height_field = document.getElementById(selector.id + "-height");
        height_field.readOnly = width_field.readOnly = (selector.value !== "other")

        if (selector.value !== "other") {
            width_field.value = selector.calc_selectorValues[selector.value].w
            height_field.value = selector.calc_selectorValues[selector.value].h
        }
    }

    for (var key in selectors) {
        var element = document.getElementById(key);
        element.calc_selectorValues = selectors[key];
        element.addEventListener("change", onSelectorChanged);
        var changeEvent = new Event('change', {
            'bubbles': true,
            'cancelable': true
        });
        element.dispatchEvent(changeEvent);
    }
})();

// Замыкание
(function() {
    /**
     * Корректировка округления десятичных дробей.
     *
     * @param {String}  type  Тип корректировки.
     * @param {Number}  value Число.
     * @param {Integer} exp   Показатель степени (десятичный логарифм основания корректировки).
     * @returns {Number} Скорректированное значение.
     */
    function decimalAdjust(type, value, exp) {
      // Если степень не определена, либо равна нулю...
      if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
      }
      value = +value;
      exp = +exp;
      // Если значение не является числом, либо степень не является целым числом...
      if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
      }
      // Сдвиг разрядов
      value = value.toString().split('e');
      value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
      // Обратный сдвиг
      value = value.toString().split('e');
      return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }
  
    // Десятичное округление к ближайшему
    if (!Math.round10) {
      Math.round10 = function(value, exp) {
        return decimalAdjust('round', value, exp);
      };
    }
    // Десятичное округление вниз
    if (!Math.floor10) {
      Math.floor10 = function(value, exp) {
        return decimalAdjust('floor', value, exp);
      };
    }
    // Десятичное округление вверх
    if (!Math.ceil10) {
      Math.ceil10 = function(value, exp) {
        return decimalAdjust('ceil', value, exp);
      };
    }
  })();

document.getElementById('object_size_calc-input').addEventListener("submit", function (e) {
    e.preventDefault()

    this.focal_len.value;
    var distance = this.distance.value*this.distance_unit.value;
    this.matrix_format_width.value;
    this.matrix_format_height.value;
    this.resolution_width.value;
    this.resolution_height.value;

    form_out = document.getElementById('object_size_calc-output')

    var magnify = (distance-this.focal_len.value)/this.focal_len.value
    var maximum_visible_area_width = Math.round10(this.matrix_format_width.value*magnify,-2)
    var maximum_visible_area_height = Math.round10(this.matrix_format_height.value*magnify,-2)
    form_out.maximum_visible_area.value = maximum_visible_area_width.toString()+" x "+maximum_visible_area_height.toString()

    var minimum_object_size_width = Math.round10(maximum_visible_area_width/this.resolution_width.value,-2)
    var minimum_object_size_height = Math.round10(maximum_visible_area_height/this.resolution_height.value,-2)
    form_out.minimum_object_size.value = minimum_object_size_width.toString()+" x "+minimum_object_size_height.toString()

    fov_width = Math.round10(2*Math.atan((maximum_visible_area_width/2)/distance)*180/Math.PI, -2)
    fov_height = Math.round10(2*Math.atan((maximum_visible_area_width)/2/distance)*180/Math.PI, -2)
    form_out.maximum_fov.value = Math.max(fov_width, fov_height)
})

document.getElementById('focal_length_calc-input').addEventListener("submit", function (e) {
    e.preventDefault()

    this.matrix_format_width.value;
    this.matrix_format_height.value;
    var distance = this.distance.value*this.distance_unit.value;
    this.fov_width.value;

    form_out = document.getElementById('focal_length_calc-output')
    form_out.focal_len.value = Math.round10(distance/(this.fov_width.value/this.matrix_format_width.value+1),-2);

    form_out.maximum_fov.value = Math.round10(2*Math.atan((this.matrix_format_width.value/2)/(distance*this.matrix_format_width.value/this.fov_width.value))*180/Math.PI, -2)
})