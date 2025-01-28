# frozen_string_literal: true

module Dnd5NewCharacter
  module Classes
    class MonkDecorator
      WEAPON_CORE = ['light weapon'].freeze
      DEFAULT_WEAPON_SKILLS = ['Shortsword'].freeze

      def decorate(result:)
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS)

        result
      end
    end
  end
end
