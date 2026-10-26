# frozen_string_literal: true

module ApplicationHelper
  include Pagy::Frontend
  include Authkeeper::ApplicationHelper

  SEO_LOCALES = %i[en ru es].freeze
  SEO_HOSTS = {
    global: { host: 'charkeeper.org', default_locale: :en, region: nil },
    ru: { host: 'charkeeper.ru', default_locale: :ru, region: 'RU' }
  }.freeze

  def seo_canonical_url
    seo_url(host_config: current_seo_host, locale: I18n.locale)
  end

  def seo_hreflang_urls
    SEO_HOSTS.values.flat_map do |host_config|
      SEO_LOCALES.map do |locale|
        hreflang = [locale, host_config[:region]].compact.join('-')
        [hreflang, seo_url(host_config: host_config, locale: locale)]
      end
    end.append(['x-default', seo_url(host_config: SEO_HOSTS[:global], locale: :en)])
  end

  def change_locale(locale)
    url_for(request.params.merge(locale: locale.to_s))
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

  def root_host
    return 'charkeeper.ru' if Rails.env.ru_production?
    return 'charkeeper.org' if Rails.env.production?

    'localhost:5000'
  end

  private

  def current_seo_host
    Rails.env.ru_production? ? SEO_HOSTS[:ru] : SEO_HOSTS[:global]
  end

  def seo_url(host_config:, locale:)
    locale = locale.to_sym
    locale = nil if locale == host_config[:default_locale]

    url_for(
      request.path_parameters.merge(
        locale: locale,
        host: host_config[:host],
        protocol: 'https',
        only_path: false
      )
    )
  end

  def component_props(props)
    props
      .except(:component_id, :component_class, :children)
      .deep_transform_keys! { |key| key.to_s.camelize(:lower) }
      .to_json
  end
end
