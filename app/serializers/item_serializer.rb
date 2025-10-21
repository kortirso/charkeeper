# frozen_string_literal: true

class ItemSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id slug kind name data info homebrew].freeze

  attributes(*ATTRIBUTES)

  def name
    object.name[I18n.locale.to_s]
  end

  def homebrew # rubocop: disable Naming/PredicateMethod
    !object.user_id.nil?
  end
end
