# frozen_string_literal: true

class ItemSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id slug kind name original_name data info homebrew has_description features modifiers].freeze

  attributes(*ATTRIBUTES)

  def name
    translate(object.name)
  end

  def original_name
    object.name['en']
  end

  def homebrew # rubocop: disable Naming/PredicateMethod
    !object.user_id.nil?
  end

  def has_description # rubocop: disable Naming/PredicateMethod, Naming/PredicatePrefix
    translate(object.description).present?
  end

  def data
    object.data.attributes
  end

  def features
    return unless context
    return unless context[:version]

    markdown = Charkeeper::Container.resolve('markdown')
    object.info['features']&.map { |feature| markdown.call(value: translate(feature), version: context[:version]) }
  end

  def modifiers
    object.modifiers.transform_values { |value| value['value'] }
  end
end
