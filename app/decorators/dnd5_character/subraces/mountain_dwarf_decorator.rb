# frozen_string_literal: true

module Dnd5Character
  module Subraces
    class MountainDwarfDecorator
      ARMOR = ['light armor', 'medium armor'].freeze

      def decorate_fresh_character(result:)
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq

        result
      end

      def decorate_character_abilities(result:)
        result
      end
    end
  end
end
