# frozen_string_literal: true

module Pathfinder2
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug title description origin_value origin_values price info original_title focus_for].freeze

    attributes(*ATTRIBUTES)

    def title
      translate(object.title)
    end

    def original_title
      object.title['en']
    end

    def description
      Charkeeper::Container.resolve('markdown').call(
        value: translate(object.description),
        version: (context ? (context[:version] || nil) : nil),
        initial_version: '0.4.0'
      )
    end

    def origin_value
      object.origin_value.split(',')
    end

    def origin_values
      object.origin_values.map { |item| I18n.t("tags.pathfinder.general.#{item}") }
    end

    def focus_for
      object.origin_values.include?('uncommon') ? (object.origin_values & Pathfinder2::Character.classes_info.keys).first : nil
    end
  end
end
