# frozen_string_literal: true

module Dnd5NewCharacter
  module Classes
    class DruidDecorator
      LANGUAGES = %w[druidic].freeze
      DEFAULT_WEAPON_SKILLS = %w[Quarterstaff Mace Dart Club Dagger Spear Javelin Sling Sickle Scimitar].freeze
      ARMOR = ['light armor'].freeze

      def decorate(result:)
        result[:languages] = result[:languages].concat(LANGUAGES)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS)
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR)

        result
      end
    end
  end
end
