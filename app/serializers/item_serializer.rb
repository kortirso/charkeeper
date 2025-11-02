# frozen_string_literal: true

class ItemSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id slug kind name data info homebrew has_description].freeze

  attributes(*ATTRIBUTES)

  def name
    object.name[I18n.locale.to_s]
  end

  def homebrew # rubocop: disable Naming/PredicateMethod
    !object.user_id.nil?
  end

  def has_description # rubocop: disable Naming/PredicateMethod, Naming/PredicatePrefix
    object.description[I18n.locale.to_s].present?
  end
end
