# frozen_string_literal: true

module Dnd2024
  class SpellSerializer < ApplicationSerializer
    ATTRIBUTES = %i[
      id slug title level school origin_values time range hit dc components effects duration damage_up concentration ritual
    ].freeze

    INFO_ATTRIBUTES = %i[level school time range hit dc components effects area duration damage_up concentration ritual].freeze

    attributes(*ATTRIBUTES)

    delegate :info, to: :object

    INFO_ATTRIBUTES.each do |method_name|
      define_method(method_name) do
        info[method_name.to_s]
      end
    end

    def title
      translate(object.title)
    end

    def extract_info
      info
    end
  end
end
