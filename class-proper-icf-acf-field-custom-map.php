<?php
/**
 * Defines the custom field type class.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * proper_icf_acf_field_custom_map_field class.
 */
class proper_icf_acf_field_custom_map_field extends acf_field {
	/**
	 * Controls field type visibilty in REST requests.
	 *
	 * @var bool
	 */
	public $show_in_rest = true;

	/**
	 * Environment values relating to the theme or plugin.
	 *
	 * @var array $env Plugin or theme context such as 'url' and 'version'.
	 */
	private $env;

	/**
	 * Constructor.
	 */
	public function __construct() {
		/**
		 * Field type reference used in PHP and JS code.
		 *
		 * No spaces. Underscores allowed.
		 */
		$this->name = 'custom_map_field';

		/**
		 * Field type label.
		 *
		 * For public-facing UI. May contain spaces.
		 */
		$this->label = __( 'Image Coordinate Field', 'proper-icf' );

		/**
		 * The category the field appears within in the field type picker.
		 */
		$this->category = 'basic'; // basic | content | choice | relational | jquery | layout | CUSTOM GROUP NAME

		/**
		 * Field type Description.
		 *
		 * For field descriptions. May contain spaces.
		 */
		$this->description = __( 'Adds image coordinate field to posts to display as map ', 'proper-icf' );

		/**
		 * Field type Doc URL.
		 *
		 * For linking to a documentation page. Displayed in the field picker modal.
		 */
		$this->doc_url = '';

		/**
		 * Field type Tutorial URL.
		 *
		 * For linking to a tutorial resource. Displayed in the field picker modal.
		 */
		$this->tutorial_url = '';

		/**
		 * Defaults for your custom user-facing settings for this field type.
		 */
		$this->defaults = array(
			'map_image'	=> "",
		);

		/**
		 * Strings used in JavaScript code.
		 *
		 * Allows JS strings to be translated in PHP and loaded in JS via:
		 *
		 * ```js
		 * const errorMessage = acf._e("custom_map_field", "error");
		 * ```
		 */
		$this->l10n = array(
			'error'	=> __( 'Error! Please provide an image', 'proper-icf' ),
		);

		$this->env = array(
			'url'     => site_url( str_replace( ABSPATH, '', __DIR__ ) ), // URL to the acf-custom-map-field directory.
			'version' => '1.0', // Replace this with your theme or plugin version constant.
		);

		/**
		 * Field type preview image.
		 *
		 * A preview image for the field type in the picker modal.
		 */
		$this->preview_image = $this->env['url'] . '/assets/images/field-preview-custom.png';

		parent::__construct();
	}

	/**
	 * Settings to display when users configure a field of this type.
	 *
	 * These settings appear on the ACF “Edit Field Group” admin page when
	 * setting up the field.
	 *
	 * @param array $field
	 * @return void
	 */
	public function render_field_settings( $field ) {
		/*
		 * Repeat for each setting you wish to display for this field type.
		 */
		acf_render_field_setting(
			$field,
			array(
				'label'			=> __( 'Map image','proper-icf' ),
				'instructions'	=> __( 'Choose the image to use as a map','proper-icf' ),
				'type'			=> 'image',
				'name'			=> 'map_image',
			)
		);
		acf_render_field_setting(
			$field,
			array(
				'label'			=> __( 'Pin image','proper-icf' ),
				'instructions'	=> __( 'Choose the image to use as the pin','proper-icf' ),
				'type'			=> 'image',
				'name'			=> 'pin_image',
			)
		);

		// To render field settings on other tabs in ACF 6.0+:
		// https://www.advancedcustomfields.com/resources/adding-custom-settings-fields/#moving-field-setting
	}

	/**
	 * HTML content to show when a publisher edits the field on the edit screen.
	 *
	 * @param array $field The field settings and values.
	 * @return void
	 */
	public function render_field( $field ) {
		// Debug output to show what field data is available.
		
				// value
		$field['value'] = acf_parse_args($field['value'], array(
			'x'		=> '',
			'y'		=> ''
		));

		?>
<div id=<?php echo $field['id'] ?> class="acf-custom-map-field <?php echo $field['class']?>">
    <div id="map" class="map" style="height:400px; width:80%"></div>
    <div class="acf-hidden">
        <?php foreach( $field['value'] as $k => $v ): ?>
        <input type="hidden" id="input-<?php echo $k; ?>"
            name="<?php echo esc_attr($field['name']); ?>[<?php echo $k; ?>]" value="<?php echo esc_attr( $v ); ?>" />
        <?php endforeach; ?>
    </div>
    <?php
	}

	/**
		 * Apply basic formatting to prepare the value for default REST output.
		 *
		 * @param mixed      $value
		 * @param string|int $post_id
		 * @param array      $field
		 * @return mixed
		 */
		public function format_value_for_rest( $value, $post_id, array $field ) {
			// Adds map image from the field option to the rest API
			$return_value = array();
		
			$return_value['map'] = wp_get_attachment_image_src($field['map_image'], 'large');
			if ($field['value']){

				$return_value['x'] = $field['value']['x'] ? maybe_unserialize($field['value']['x']) : '' ;
				$return_value['y'] = $field['value']['y'] ?  maybe_unserialize($field['value']['y']) : '';
			}
			$return_value['pin'] = wp_get_attachment_image_src($field['pin_image']) ? wp_get_attachment_image_src($field['pin_image']) : $this->env['url'] . '/assets/images/map-pin.png';
			
			return $return_value;
		
		}

	/**
	 * Enqueues CSS and JavaScript needed by HTML in the render_field() method.
	 *
	 * Callback for admin_enqueue_script.
	 *
	 * @return void
	 */
	public function input_admin_enqueue_scripts() {
		$url     = trailingslashit( $this->env['url'] );
		$version = $this->env['version'];

		wp_register_script(
			'proper_icf-custom-map',
			"{$url}build/index.js",
			array( 'acf-input', "wp-api-fetch" ),
			$version
		);

		wp_register_style(
			'proper_icf-custom-map',
			"{$url}assets/css/field.css",
			array( 'acf-input' ),
			$version
		);


		wp_enqueue_script( 'proper_icf-custom-map' );
		wp_enqueue_style( 'proper_icf-custom-map' );
	}
}