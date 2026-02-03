# frozen_string_literal: true

module TranslateHelper
  def translate(hash)
    return unless hash
    return hash[I18n.locale.to_s] if hash.key?(I18n.locale.to_s)
    return hash[I18n.locale] if hash.key?(I18n.locale)

    hash['en'] || hash[:en]
  end
end
