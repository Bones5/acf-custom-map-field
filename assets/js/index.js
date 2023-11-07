import Feature from 'ol/Feature';
import apiFetch from '@wordpress/api-fetch';
import Map from 'ol/Map';
import View from 'ol/View';
import { Point } from 'ol/geom';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { Projection } from 'ol/proj';
import { getCenter } from 'ol/extent';
import Drag from './olDragEvent';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import defaultPin from '../images/map-pin.png';
// import { select } from '@wordpress/data';
// import { store as editorStore } from '@wordpress/editor';
/**
 * Included when custom_map_field fields are rendered for editing by publishers.
 */
( function ( $ ) {
	function initialize_field( $field ) {
		apiFetch( { path: `/wp/v2/posts/` } )
			.then( ( currentPostType ) => {
				// console.log( $field );

				// const postType = select( editorStore ).getCurrentPost();
				// console.log( postType );

				// console.log( currentPostType );
				const mapImage = currentPostType[ 0 ]?.acf?.map_position?.map;
				const pinImage = currentPostType[ 0 ]?.acf?.map_position?.pin;

				/**
				 * $field is a jQuery object wrapping field elements in the editor.
				 */
				const extent = [ 0, 0, mapImage[ 1 ], mapImage[ 2 ] ];
				const projection = new Projection( {
					code: 'xkcd-image',
					units: 'pixels',
					extent: extent,
				} );

				// Get our map dimensions from PHP
				const mapWidth = mapImage[ 1 ];
				const mapHeight = mapImage[ 2 ];
				const mapCenter = [ mapWidth / 2, mapHeight / 2 ];

				// Set the location of the pin if one has already been defined
				let xCoord = parseFloat( $( '#input-x' ).val() );
				let yCoord = parseFloat( $( '#input-y' ).val() );

				// If no previous licatuion had been defined set it to the centre of the map
				if ( ! xCoord || xCoord > mapWidth ) xCoord = mapWidth / 2;
				if ( ! yCoord || yCoord > mapHeight ) yCoord = mapHeight / 2;

				var pointFeature = new Feature(
					new Point( [ xCoord, yCoord ] )
				);

				new Map( {
					interactions: defaultInteractions().extend( [
						new Drag(),
					] ),
					target: 'map',
					layers: [
						new ImageLayer( {
							source: new ImageStatic( {
								url: mapImage[ 0 ],
								projection,
								imageExtent: extent,
							} ),
						} ),
						new VectorImageLayer( {
							source: new VectorSource( {
								features: [ pointFeature ],
							} ),
							style: new Style( {
								image: new Icon( {
									opacity: 0.95,
									src: pinImage ? pinImage : defaultPin,
									anchor: [ 0.5, 1 ],
								} ),
							} ),
						} ),
					],
					view: new View( {
						projection: projection,
						center: getCenter( extent ),
						zoom: 2,
					} ),
				} );
			} )
			.catch( ( e ) => console.log( e ) );
	}

	if ( typeof acf.add_action !== 'undefined' ) {
		/**
		 * Run initialize_field when existing fields of this type load,
		 * or when new fields are appended via repeaters or similar.
		 */
		console.log( 'bum' );
		acf.add_action( 'ready_field/type=custom_map_field', initialize_field );
		acf.add_action(
			'append_field/type=custom_map_field',
			initialize_field
		);
	}
} )( jQuery );
