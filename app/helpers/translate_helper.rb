# frozen_string_literal: true

module TranslateHelper
  I18N_FALLBACKS = { 'ru-DHM' => 'ru' }.freeze

  def translate(hash)
    return unless hash.is_a?(Hash)

    hash = hash.with_indifferent_access
    return hash[I18n.locale] if hash[I18n.locale].present?

    fallback_locale = I18N_FALLBACKS[I18n.locale.to_s]
    return hash[fallback_locale] if fallback_locale && hash[fallback_locale].present?

    hash['en'] || hash[:en]
  end
end
