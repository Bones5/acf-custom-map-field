(function ($) {
  function initialize_field($el) {
    //$el.doStuff();
  }

  if (typeof acf.add_action !== "undefined") {
    /*
     *  ready append (ACF5)
     *
     *  These are 2 events which are fired during the page load
     *  ready = on page load similar to $(document).ready()
     *  append = on new DOM elements appended via repeater field
     *
     *  @type	event
     *  @date	20/07/13
     *
     *  @param	$el (jQuery selection) the jQuery element which contains the ACF fields
     *  @return	n/a
     */

    acf.add_action("ready append", function ($el) {
      // search $el for fields of type 'openlayers_map'
      acf.get_fields({ type: "openlayers_map" }, $el).each(function () {
        if (phpVars !== undefined) console.log(phpVars);

        initialize_field($(this));

        /**
         * Define a namespace for the application.
         */
        var app = {};

        /**
         * @constructor
         * @extends {ol.interaction.Pointer}
         */
        app.Drag = function () {
          ol.interaction.Pointer.call(this, {
            handleDownEvent: app.Drag.prototype.handleDownEvent,
            handleDragEvent: app.Drag.prototype.handleDragEvent,
            handleMoveEvent: app.Drag.prototype.handleMoveEvent,
            handleUpEvent: app.Drag.prototype.handleUpEvent,
          });

          /**
           * @type {ol.Pixel}
           * @private
           */
          this.coordinate_ = null;

          /**
           * @type {string|undefined}
           * @private
           */
          this.cursor_ = "pointer";

          /**
           * @type {ol.Feature}
           * @private
           */
          this.feature_ = null;

          /**
           * @type {string|undefined}
           * @private
           */
          this.previousCursor_ = undefined;
        };
        ol.inherits(app.Drag, ol.interaction.Pointer);

        /**
         * @param {ol.MapBrowserEvent} evt Map browser event.
         * @return {boolean} `true` to start the drag sequence.
         */
        app.Drag.prototype.handleDownEvent = function (evt) {
          var map = evt.map;

          var feature = map.forEachFeatureAtPixel(
            evt.pixel,
            function (feature, layer) {
              return feature;
            }
          );

          if (feature) {
            this.coordinate_ = evt.coordinate;
            this.feature_ = feature;
          }

          return !!feature;
        };

        /**
         * @param {ol.MapBrowserEvent} evt Map browser event.
         */
        app.Drag.prototype.handleDragEvent = function (evt) {
          var map = evt.map;

          feature = map.forEachFeatureAtPixel(
            evt.pixel,
            function (feature, layer) {
              return feature;
            }
          );

          var deltaX = evt.coordinate[0] - this.coordinate_[0];
          var deltaY = evt.coordinate[1] - this.coordinate_[1];

          var geometry =
            /** @type {ol.geom.SimpleGeometry} */
            (this.feature_.getGeometry());
          geometry.translate(deltaX, deltaY);

          this.coordinate_[0] = evt.coordinate[0];
          this.coordinate_[1] = evt.coordinate[1];

          if (feature !== undefined) {
            // Set the hidden coordinates fields to the coords of the feature
            $("#input-x").val(feature.getGeometry().flatCoordinates[0]);
            $("#input-y").val(feature.getGeometry().flatCoordinates[1]);
          }
        };

        /**
         * @param {ol.MapBrowserEvent} evt Event.
         */
        app.Drag.prototype.handleMoveEvent = function (evt) {
          if (this.cursor_) {
            var map = evt.map;
            var feature = map.forEachFeatureAtPixel(
              evt.pixel,
              function (feature, layer) {
                return feature;
              }
            );
            var element = evt.map.getTargetElement();
            if (feature) {
              if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
              }
            } else if (this.previousCursor_ !== undefined) {
              element.style.cursor = this.previousCursor_;
              this.previousCursor_ = undefined;
            }
          }
        };

        /**
         * @param {ol.MapBrowserEvent} evt Map browser event.
         * @return {boolean} `false` to stop the drag sequence.
         */
        app.Drag.prototype.handleUpEvent = function (evt) {
          this.coordinate_ = null;
          this.feature_ = null;
          return false;
        };

        var extent = [0, 0, phpVars.mapImageWidth, phpVars.mapImageHeight];
        var projection = new ol.proj.Projection({
          code: "map-image",
          units: "pixels",
          extent: extent,
        });

        // Get our map dimensions from PHP
        var mapWidth = phpVars.mapImageWidth;
        var mapHeight = phpVars.mapImageHeight;
        var mapCenter = [mapWidth / 2, mapHeight / 2];

        // Set the location of the pin if one has already been defined
        var xCoord = parseFloat($("#input-x").val());
        var yCoord = parseFloat($("#input-y").val());

        // If no previous licatuion had been defined set it to the centre of the map
        if (!xCoord) xCoord = mapWidth / 2;
        if (!yCoord) yCoord = mapHeight / 2;

        var pointFeature = new ol.Feature(new ol.geom.Point([xCoord, yCoord]));

        var map = new ol.Map({
          interactions: ol.interaction.defaults().extend([new app.Drag()]),
          layers: [
            new ol.layer.Image({
              source: new ol.source.ImageStatic({
                url: phpVars.mapImageUrl,
                projection: projection,
                imageExtent: extent,
              }),
            }),
            new ol.layer.Vector({
              source: new ol.source.Vector({
                features: [pointFeature],
              }),
              style: new ol.style.Style({
                image: new ol.style.Icon(
                  /** @type {olx.style.IconOptions} */ ({
                    opacity: 0.95,
                    src: phpVars.pinImage,
                    anchor: [0.5, 1],
                  })
                ),
              }),
            }),
          ],
          target: "map",
          view: new ol.View({
            projection: projection,
            center: ol.extent.getCenter(extent),
            zoom: 2,
            maxZoom: 8,
          }),
        });

        // Get ratio of map size to image size
        mapSize = map.getSize();

        if (typeof mapSize !== "undefined") {
          widthRatio = mapWidth / mapSize[0];
          heightRatio = mapHeight / mapSize[1];

          // Get the highest of the ratios,
          // this is the one we will use so that the whole map wil be displayed on page load
          maxRes = Math.max(widthRatio, heightRatio);
          minRes = maxRes / 4;

          // Create a view with our resolutions
          map.setView(
            new ol.View({
              projection: projection,
              center: mapCenter,
              resolution: maxRes,
              minResolution: minRes,
              maxResolution: maxRes,
              extent: [0, 0, mapWidth, mapHeight],
              zoomFactor: 1.4,
              enableRotation: false,
            })
          );
        }
      });
    });
  } else {
    /*
     *  acf/setup_fields (ACF4)
     *
     *  This event is triggered when ACF adds any new elements to the DOM.
     *
     *  @type	function
     *  @since	1.0.0
     *  @date	01/01/12
     *
     *  @param	event		e: an event object. This can be ignored
     *  @param	Element		postbox: An element which contains the new HTML
     *
     *  @return	n/a
     */

    $(document).on("acf/setup_fields", function (e, postbox) {
      $(postbox)
        .find('.field[data-field_type="openlayers_map"]')
        .each(function () {
          initialize_field($(this));
        });
    });
  }
})(jQuery);
