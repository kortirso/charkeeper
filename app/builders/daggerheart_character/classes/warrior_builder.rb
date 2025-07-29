# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class WarriorBuilder
      def call(result:)
        result[:evasion] = 11
        result[:health_max] = 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 1, 'agi' => 2, 'fin' => 0, 'ins' => 1, 'pre' => -1, 'know' => 0 }
        result
      end

      def equip(character:)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'longsword'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'chainmail_armor'), ready_to_use: true)
      end
    end
  end
end
