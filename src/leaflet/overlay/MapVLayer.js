/**
 * Class:MapVLayer
 *  MapV图层
 */
var L = require("leaflet");
var MapVRenderer = require("./mapv/MapVRenderer");
var MapVLayer = L.Layer.extend({

    options: {
        attribution: '© 2017 百度 MapV with <a href="http://icltest.supermapol.com/">SuperMap iClient</a>'
    },

    initialize: function (dataSet, mapVOptions, options) {
        options = options || {};
        this.dataSet = dataSet || {};
        this.mapVOptions = mapVOptions || {};
        this.render = this.render.bind(this);
        L.Util.setOptions(this, options);
        this.canvas = this._createCanvas();
        L.stamp(this);
    },


    onAdd: function (map) {
        this._map = map;
        var overlayPane = this.getPane();
        var container = this.container = L.DomUtil.create("div", "leaflet-layer leaflet-zoom-animated", overlayPane);
        container.appendChild(this.canvas);
        var size = map.getSize();
        container.style.width = size.x + "px";
        container.style.height = size.y + "px";
        this.mapvLayer = new MapVRenderer(map, this, this.dataSet, this.mapVOptions);
        this.draw();
        this.fire("loaded");
    },

    getEvents: function () {
        return {
            moveend: this.draw,
            zoomstart:this._hide,
            zoomend:this._show
        }

    },
    _hide : function () {
        this.canvas.style.display = 'none';
    },

    _show : function () {
        this.canvas.style.display = 'block';
    },
    onRemove: function (map) {
        L.DomUtil.remove(this.container);
        map.off({
            moveend: this.draw,
            zoomstart:this._hide,
            zoomend:this._show
        }, this);
    },

    update: function (data, options) {
        this.mapvLayer.updateData(data, options);
    },

    draw: function () {
        return this._reset();
    },

    setZIndex: function (zIndex) {
        this.canvas.style.zIndex = zIndex;
    },

    render: function () {
        this.mapvLayer._canvasUpdate();
    },

    getCanvas: function () {
        return this.canvas;
    },

    getContainer: function () {
        return this.container;
    },

    getTopLeft: function () {
        var map = this._map;
        var topLeft;
        if (map) {
            var bounds = map.getBounds();
            topLeft = bounds.getNorthWest();
        }
        return topLeft;

    },

    _createCanvas: function () {
        var canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = 0 + "px";
        canvas.style.left = 0 + "px";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = this.options.zIndex || 600;
        return canvas;
    },


    _resize: function () {
        var canvas = this.canvas;
        if (!canvas) {
            return;
        }

        var map = this._map;
        var size = map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.style.width = size.x + 'px';
        canvas.style.height = size.y + 'px';
        var bounds =map.getBounds();
        var topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
        L.DomUtil.setPosition(canvas, topLeft);

    },

    _reset: function () {
        this._resize();
        this._render()
    },
    redraw: function () {
        this._resize();
        this._render()
    },
    _render: function () {
        this.render();
    },

});

L.supermap.mapVLayer = function (dataSet, mapVOptions, options) {
    return new MapVLayer(dataSet, mapVOptions, options);
};
module.exports = MapVLayer;