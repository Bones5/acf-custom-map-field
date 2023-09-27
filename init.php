<?php
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
