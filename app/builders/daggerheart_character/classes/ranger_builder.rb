# frozen_string_literal: true

module DaggerheartCharacter
  module Classes
    class RangerBuilder
      def call(result:)
        result[:evasion] = 12
        result[:health_max] = 6
        result[:stress_max] = 6
        result[:hope_max] = 6
        result[:traits] = { 'str' => 0, 'agi' => 2, 'fin' => 1, 'ins' => 1, 'pre' => -1, 'know' => 0 }
        result
      end

      def equip(character:)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'shortbow'), ready_to_use: true)
        Character::Item.create(character: character, item: Daggerheart::Item.find_by(slug: 'leather_armor'), ready_to_use: true)
      end
    end
  end
end
