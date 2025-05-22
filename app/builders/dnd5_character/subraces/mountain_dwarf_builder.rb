# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class MountainDwarfBuilder
      ARMOR = ['light armor', 'medium armor'].freeze

      def call(result:)
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq

        result
      end
    end
  end
end
