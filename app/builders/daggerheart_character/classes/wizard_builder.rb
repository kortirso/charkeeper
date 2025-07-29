# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class WizardBuilder
      def call(result:)
        result[:evasion] = 11
        result[:health_max] = 5
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 0, 'agi' => -1, 'fin' => 0, 'ins' => 1, 'pre' => 1, 'know' => 2 }
        result
      end

      def equip(character:)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'greatstaff'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'leather_armor'), ready_to_use: true)
      end
    end
  end
end
