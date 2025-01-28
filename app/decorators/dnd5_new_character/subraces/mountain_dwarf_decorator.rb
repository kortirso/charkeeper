# frozen_string_literal: true

module Dnd5NewCharacter
  module Subraces
    class MountainDwarfDecorator
      ARMOR = ['light armor', 'medium armor'].freeze

      def decorate(result:)
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR)

        result
      end
    end
  end
end
