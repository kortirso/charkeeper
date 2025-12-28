# frozen_string_literal: true

module Dc20
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[id slug title description origin_value origin_values price info school].freeze

    attributes(*ATTRIBUTES)

    def title
      object.title[I18n.locale.to_s]
    end

    def description
      object.description[I18n.locale.to_s]
    end

    def origin_value
      object.origin_value.split(',')
    end

    def school
      object.info['school']
    end
  end
end
