# frozen_string_literal: true

module ApplicationHelper
  include Pagy::Frontend
  include Authkeeper::ApplicationHelper

  def change_locale(locale)
    url_for(request.params.merge(switch_locale: locale.to_s))
  end

  def close_cookie_banner
    url_for(request.params.merge(close_cookie_banner: true))
  end

  def js_component(component_name, **props)
    content_tag(
      'div',
      id: props[:component_id],
      class: props[:component_class],
      data: {
        js_component: component_name,
        props: component_props(props),
        children: props[:children]&.to_json
      }.compact
    ) { '' }
  end

  private

  def component_props(props)
    props
      .except(:component_id, :component_class, :children)
      .deep_transform_keys! { |key| key.to_s.camelize(:lower) }
      .to_json
  end
end
