<?php
/*
Plugin Name:  ACF custom map field plugin
Plugin URI:   https://www.wpbeginner.com
Description:  A short little description of the plugin. It will be displayed on the Plugins page in WordPress admin area.
Version:      1.0
Author:       WPBeginner
Author URI:   https://www.wpbeginner.com
License:      GPL2
License URI:  https://www.gnu.org/licenses/gpl-2.0.html
Text Domain:  proper-icf
Domain Path:  /languages
*/
/**
 * Registration logic for the new ACF field type.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'proper_icf_include_acf_field_custom_map_field' );
/**
 * Registers the ACF field type.
 */
function proper_icf_include_acf_field_custom_map_field() {
	if ( ! function_exists( 'acf_register_field_type' ) ) {
		return;
	}

	require_once __DIR__ . '/class-proper-icf-acf-field-custom-map.php';

	acf_register_field_type( 'proper_icf_acf_field_custom_map_field' );
}