# frozen_string_literal: true

module Dnd5NewCharacter
  module Classes
    class WizardDecorator
      DEFAULT_WEAPON_SKILLS = ['Quarterstaff', 'Dart', 'Dagger', 'Sling', 'Light Crossbow'].freeze

      def decorate(result:)
        result[:weapon_skills] = result[:weapon_skills].concat(DEFAULT_WEAPON_SKILLS)

        result
      end
    end
  end
end
